from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
import time

from system.core.config import normalize_payload_to_sample
from system.core.models import Config, Sample

try:
    import serial  # type: ignore
    from serial.tools import list_ports  # type: ignore
except Exception:  # pragma: no cover
    serial = None
    list_ports = None

# Protocol constants
HANDSHAKE_COMMAND = b"VALE_HELLO\n"
HANDSHAKE_TIMEOUT_SEC = 2.0
VALE_PROTOCOL_NAME = "VALE_SENSOR_V1"


@dataclass
class HandshakeResult:
    success: bool
    device: str = ""
    protocol: str = ""
    fields: list[str] | None = None
    rate_hz: float | None = None
    raw_response: str = ""
    error: str = ""


@dataclass
class SerialSource:
    cfg: Config
    source_id: str = "SERIAL"

    def __post_init__(self) -> None:
        self._serial = None
        self._connection_state = "DISCONNECTED"
        self._connection_error = ""
        self._last_read_state = "NO_DATA"
        self._last_failure_cause = "not_connected"

        self._last_raw_line = ""
        self._last_raw_ts: float | None = None
        self._line_count = 0
        self._parse_fail_count = 0
        self._parse_fail_streak = 0
        self._last_parse_error = ""
        self._last_good_sample: Sample | None = None

        self._same_line_streak = 0
        self._last_data_ts: float | None = None

        # Protocol mode tracking
        self._protocol_mode = "UNKNOWN"  # UNKNOWN|GENERIC_JSON|GENERIC_CSV|VALE_SENSOR_V1
        self._handshake_result: HandshakeResult | None = None
        self._handshake_attempted = False

    @property
    def parse_fail_streak(self) -> int:
        return int(self._parse_fail_streak)

    @property
    def connection_state(self) -> str:
        return self._connection_state

    @property
    def connection_error(self) -> str:
        return self._connection_error

    @property
    def is_connected(self) -> bool:
        return self._serial is not None and self._connection_state == "CONNECTED"

    @property
    def protocol_mode(self) -> str:
        return self._protocol_mode

    def _reset_runtime_diagnostics(self) -> None:
        self._last_raw_line = ""
        self._last_raw_ts = None
        self._line_count = 0
        self._parse_fail_count = 0
        self._parse_fail_streak = 0
        self._last_parse_error = ""
        self._last_good_sample = None
        self._same_line_streak = 0
        self._last_data_ts = None
        self._protocol_mode = "UNKNOWN"
        self._handshake_result = None
        self._handshake_attempted = False

    def connect(self) -> bool:
        if serial is None:
            self._serial = None
            self._connection_state = "UNAVAILABLE"
            self._connection_error = "pyserial_not_installed"
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = "pyserial_not_installed"
            return False

        self.disconnect()
        port = str(self.cfg.serial_port).strip()
        if not port:
            self._connection_state = "ERROR"
            self._connection_error = "serial_port_empty"
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = "serial_port_empty"
            return False

        try:
            self._serial = serial.Serial(
                port=port,
                baudrate=int(self.cfg.baudrate),
                timeout=max(0.05, float(self.cfg.serial_timeout_sec)),
            )
            self._connection_state = "CONNECTED"
            self._connection_error = ""
            self._reset_runtime_diagnostics()
            self._last_read_state = "NO_DATA"
            self._last_failure_cause = ""

            # Auto handshake if configured
            mode = str(getattr(self.cfg, "serial_protocol_mode", "AUTO")).upper()
            if mode in ("AUTO", "VALE_SENSOR_V1"):
                self._try_handshake()

            return True
        except Exception as exc:
            self._serial = None
            self._connection_state = "ERROR"
            self._connection_error = f"connect_failed:{exc}"
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = "connect_failed"
            return False

    def disconnect(self) -> bool:
        was_connected = self._serial is not None
        if self._serial is not None:
            try:
                self._serial.close()
            except Exception:
                pass
        self._serial = None
        self._connection_state = "DISCONNECTED"
        self._connection_error = ""
        self._reset_runtime_diagnostics()
        self._last_read_state = "INFRA_ERROR"
        self._last_failure_cause = "disconnected"
        return was_connected

    def reconnect(self) -> bool:
        self.disconnect()
        return self.connect()

    def list_ports(self) -> list[str]:
        if list_ports is None:
            return []
        try:
            ports = list(list_ports.comports())
        except Exception:
            return []
        names = [str(getattr(p, "device", "")).strip() for p in ports]
        return [p for p in names if p]

    # ── Handshake VALE_SENSOR_V1 ──────────────────────────────────

    def _try_handshake(self) -> HandshakeResult:
        """Attempt VALE_SENSOR_V1 handshake. Non-blocking fallback to generic."""
        self._handshake_attempted = True
        result = HandshakeResult(success=False)

        if self._serial is None:
            result.error = "not_connected"
            self._handshake_result = result
            return result

        try:
            # Save original timeout and set handshake timeout
            original_timeout = self._serial.timeout
            self._serial.timeout = HANDSHAKE_TIMEOUT_SEC

            # Flush any pending data
            self._serial.reset_input_buffer()
            self._serial.write(HANDSHAKE_COMMAND)
            self._serial.flush()

            # Read response
            raw = self._serial.readline()
            self._serial.timeout = original_timeout

            if not raw:
                result.error = "no_response"
                self._handshake_result = result
                return result

            try:
                line = raw.decode("utf-8", errors="strict").strip()
            except Exception:
                result.error = "decode_error"
                result.raw_response = raw.decode("utf-8", errors="replace").strip()
                self._handshake_result = result
                return result

            if not line:
                result.error = "empty_response"
                self._handshake_result = result
                return result

            result.raw_response = line

            # Try to parse as VALE_SENSOR_V1 handshake response
            try:
                payload = json.loads(line)
                if isinstance(payload, dict) and str(payload.get("protocol", "")).upper() == VALE_PROTOCOL_NAME:
                    result.success = True
                    result.device = str(payload.get("device", "unknown"))
                    result.protocol = VALE_PROTOCOL_NAME
                    result.fields = payload.get("fields") if isinstance(payload.get("fields"), list) else None
                    rate = payload.get("rate_hz")
                    if rate is not None:
                        try:
                            result.rate_hz = float(rate)
                        except (TypeError, ValueError):
                            pass
                    self._protocol_mode = "VALE_SENSOR_V1"
                    self._handshake_result = result
                    return result
            except (json.JSONDecodeError, ValueError):
                pass

            # Not a valid handshake response — that's OK, fallback to generic
            result.error = "not_vale_protocol"
            self._handshake_result = result
            return result

        except Exception as exc:
            result.error = f"handshake_io_error:{exc}"
            self._handshake_result = result
            return result

    def test_device(self) -> HandshakeResult:
        """Public method to explicitly test handshake with connected device."""
        if not self.is_connected:
            return HandshakeResult(success=False, error="not_connected")
        return self._try_handshake()

    # ── Parsing ───────────────────────────────────────────────────

    def _parse_json(self, text: str, source_id: str | None = None) -> Sample:
        payload = json.loads(text)
        if not isinstance(payload, dict):
            raise ValueError("json_not_object")
        return normalize_payload_to_sample(payload, self.cfg, source_id or self.source_id)

    def _parse_csv(self, text: str, source_id: str | None = None) -> Sample:
        delimiter = ","
        if "," not in text:
            if ";" in text:
                delimiter = ";"
            elif "\t" in text:
                delimiter = "\t"
        parts = [p.strip() for p in text.split(delimiter)]
        if len(parts) < 2:
            raise ValueError("csv_missing_fields")
        field_order = [
            p.strip()
            for p in str(getattr(self.cfg, "serial_csv_order", "humidity,distance_mm,temp")).split(",")
            if p.strip()
        ]
        if not field_order:
            field_order = ["humidity", "distance_mm", "temp"]
        payload: dict[str, str] = {}
        for idx, raw in enumerate(parts):
            key = field_order[idx] if idx < len(field_order) else f"extra_{idx}"
            payload[key] = raw
        return normalize_payload_to_sample(payload, self.cfg, source_id or self.source_id)

    def parse_text_line(self, line: str, source_id: str | None = None) -> Sample:
        cfg_mode = str(getattr(self.cfg, "serial_protocol_mode", "AUTO")).upper()

        # If forced CSV mode, always parse as CSV
        if cfg_mode == "GENERIC_CSV":
            return self._parse_csv(line, source_id=source_id)

        # If forced JSON mode, always parse as JSON
        if cfg_mode == "GENERIC_JSON":
            return self._parse_json(line, source_id=source_id)

        # AUTO or VALE_SENSOR_V1: auto-detect by content
        if line.startswith("{"):
            return self._parse_json(line, source_id=source_id)
        return self._parse_csv(line, source_id=source_id)

    # ── Read ──────────────────────────────────────────────────────

    def read(self) -> Sample | None:
        if self._serial is None:
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = "not_connected"
            return None

        try:
            raw = self._serial.readline()
        except Exception as exc:
            self._connection_state = "ERROR"
            self._connection_error = f"serial_read_failed:{exc}"
            self._serial = None
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = "serial_read_failed"
            return None

        if not raw:
            self._last_read_state = "NO_DATA"
            self._last_failure_cause = "serial_timeout"
            return None

        try:
            line = raw.decode("utf-8", errors="strict").strip()
        except Exception:
            self._line_count += 1
            self._last_raw_line = raw.decode("utf-8", errors="replace").strip() or repr(raw)
            self._last_raw_ts = time.time()
            self._parse_fail_count += 1
            self._parse_fail_streak += 1
            self._last_parse_error = "utf8_decode_error"
            self._last_read_state = "PARSE_ERROR"
            self._last_failure_cause = "line_decode_failed"
            return None

        if not line:
            self._last_read_state = "NO_DATA"
            self._last_failure_cause = "empty_line"
            return None

        previous_line = self._last_raw_line
        self._line_count += 1
        self._last_raw_line = line
        self._last_raw_ts = time.time()

        if line == previous_line:
            self._same_line_streak += 1
        else:
            self._same_line_streak = 0

        try:
            sample = self.parse_text_line(line)
        except Exception as exc:
            self._parse_fail_count += 1
            self._parse_fail_streak += 1
            self._last_parse_error = str(exc)
            self._last_read_state = "PARSE_ERROR"
            self._last_failure_cause = "line_malformed"
            return None

        # Track effective protocol mode from actual data
        if self._protocol_mode != "VALE_SENSOR_V1":
            if line.startswith("{"):
                self._protocol_mode = "GENERIC_JSON"
            else:
                self._protocol_mode = "GENERIC_CSV"

        now = time.time()
        if self._last_data_ts is not None:
            dt = now - self._last_data_ts
            if dt > max(float(self.cfg.serial_timeout_sec) * 2.0, 0.5):
                sample.flags.append("SERIAL_JITTER_HIGH")
                sample.flags.append(f"SERIAL_DT_SEC:{dt:.3f}")

        if self._same_line_streak >= 2:
            sample.flags.append("SERIAL_REPEAT")
            sample.flags.append(f"SERIAL_REPEAT_STREAK:{self._same_line_streak + 1}")
        if self._same_line_streak >= 4:
            sample.flags.append("SENSOR_STUCK_SUSPECT")

        self._last_data_ts = now
        self._last_good_sample = sample
        self._last_parse_error = ""
        self._last_failure_cause = ""
        self._last_read_state = "VALID"
        self._parse_fail_streak = 0
        return sample

    # ── Diagnostics ───────────────────────────────────────────────

    @staticmethod
    def _fmt_ts(ts: float | None) -> str:
        if ts is None:
            return ""
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()

    def _compute_probable_cause(self) -> str:
        if self._connection_state in ("DISCONNECTED", "ERROR", "UNAVAILABLE"):
            if self._connection_error == "pyserial_not_installed":
                return "pyserial_nao_instalado"
            if "connect_failed" in self._connection_error:
                return "porta_nao_encontrada"
            return "nao_conectado"
        if self._last_read_state == "NO_DATA":
            return "sem_linha_chegando"
        if self._last_read_state == "PARSE_ERROR":
            if self._parse_fail_streak >= 5:
                return "perfil_incompativel"
            return "parse_falhando"
        if self._same_line_streak >= 4:
            return "sensor_possivelmente_travado"
        if self._last_read_state == "VALID":
            if self._protocol_mode == "VALE_SENSOR_V1":
                return "dispositivo_vale_v1_detectado"
            return "leitura_normalizada_ok"
        return "causa_indefinida"

    def get_diagnostics(self) -> dict:
        last_good = None
        if self._last_good_sample is not None:
            last_good = {
                "ts": float(self._last_good_sample.ts),
                "humidity": float(self._last_good_sample.humidity),
                "distance_mm": self._last_good_sample.distance_mm,
                "temp": self._last_good_sample.temp,
                "flags": list(self._last_good_sample.flags),
            }

        stuck_hint = self._same_line_streak >= 4

        # Handshake info
        hs_info = None
        if self._handshake_result is not None:
            hs = self._handshake_result
            hs_info = {
                "success": hs.success,
                "device": hs.device,
                "protocol": hs.protocol,
                "fields": hs.fields,
                "rate_hz": hs.rate_hz,
                "raw_response": hs.raw_response,
                "error": hs.error,
            }

        return {
            "source_type": "SERIAL",
            "connection_state": self._connection_state,
            "connection_error": self._connection_error,
            "is_connected": self.is_connected,
            "last_read_state": self._last_read_state,
            "last_failure_cause": self._last_failure_cause,
            "last_raw_line": self._last_raw_line,
            "last_raw_ts": self._last_raw_ts,
            "last_raw_ts_iso": self._fmt_ts(self._last_raw_ts),
            "line_count": int(self._line_count),
            "parse_fail_count": int(self._parse_fail_count),
            "parse_fail_streak": int(self._parse_fail_streak),
            "last_parse_error": self._last_parse_error,
            "last_good_sample": last_good,
            "same_line_streak": int(self._same_line_streak),
            "stuck_hint": bool(stuck_hint),
            "probable_cause": self._compute_probable_cause(),
            "protocol_mode": self._protocol_mode,
            "handshake_attempted": self._handshake_attempted,
            "handshake_info": hs_info,
            "supported_protocols": ["GENERIC_JSON", "GENERIC_CSV", "VALE_SENSOR_V1"],
        }
