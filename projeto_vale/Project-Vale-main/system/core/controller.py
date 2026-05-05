from __future__ import annotations

from dataclasses import asdict
from pathlib import Path
import time

from system.core.config import load_config, save_config
from system.core.dataset import OperationalDataset
from system.core.anomaly import AnomalyDetector, AnomalyResult
from system.core.policy import SafetyPolicy
from system.core.actuator import SafetyActuator
from system.core.engine import Engine
from system.core.logger import EvidenceLogger
from system.core.models import CONFIG_INVALID, CONFIG_PERSIST_FAIL, Config, Event, RuntimeSnapshot
from system.core.validation import Validator
from system.io.replay_source import ReplaySource
from system.io.serial_source import SerialSource
from system.io.sim_source import SimSource


class ConfigUpdateResult(list[Event]):
    @property
    def _primary(self) -> Event:
        return self[0]

    @property
    def ts(self):
        return self._primary.ts

    @property
    def kind(self):
        return self._primary.kind

    @property
    def message(self):
        return self._primary.message

    @property
    def payload(self):
        return self._primary.payload


class Controller:
    def __init__(self, cfg: Config, source, engine: Engine, validator: Validator, logger: EvidenceLogger) -> None:
        self.cfg = cfg
        self.source = source
        self.engine = engine
        self.validator = validator
        self.logger = logger
        self._last_ts: float | None = None
        self._last_good_sample_wall_ts: float | None = None
        self._source_status: str = "OK"
        self._replay_end_emitted = False
        self._last_source_event_ts: dict[str, float] = {}
        self.dataset = OperationalDataset(relevant_change_epsilon_mm=cfg.level_stall_epsilon_mm)
        self.anomaly = AnomalyDetector()
        self.policy = SafetyPolicy()
        self.actuator = SafetyActuator(cfg)

    def _allow_source_event(self, kind: str, now: float, min_interval_sec: float = 2.0) -> bool:
        last = self._last_source_event_ts.get(kind)
        if last is not None and (now - last) < min_interval_sec:
            return False
        self._last_source_event_ts[kind] = now
        return True

    @staticmethod
    def _build_source(cfg: Config):
        if cfg.source_type == "SIM":
            return SimSource(cfg)
        if cfg.source_type == "SERIAL":
            src = SerialSource(cfg)
            src.connect()
            return src
        if cfg.source_type == "REPLAY":
            return ReplaySource(cfg)
        raise ValueError(f"Unknown source_type: {cfg.source_type}")

    @staticmethod
    def from_config(cfg: Config) -> "Controller":
        source = Controller._build_source(cfg)
        engine = Engine(cfg)
        validator = Validator()
        logger = EvidenceLogger(cfg.log_dir)
        return Controller(cfg=cfg, source=source, engine=engine, validator=validator, logger=logger)

    def rebuild_from_config(self, cfg: Config | None = None) -> list[Event]:
        if cfg is not None:
            self.cfg = cfg
        self.source = self._build_source(self.cfg)
        self.engine = Engine(self.cfg)
        self.dataset = OperationalDataset(relevant_change_epsilon_mm=self.cfg.level_stall_epsilon_mm)
        self.actuator = SafetyActuator(self.cfg)
        self._last_ts = None
        self._last_good_sample_wall_ts = None
        self._source_status = "OK"
        self._replay_end_emitted = False
        return [Event.info(time.time(), "SOURCE_REBUILT", {"source_type": self.cfg.source_type})]

    def get_config(self) -> Config:
        return self.cfg

    def update_config(self, patch: dict) -> ConfigUpdateResult:
        now = time.time()
        events = ConfigUpdateResult()

        invalid_keys = [k for k in patch if not hasattr(self.cfg, k)]
        if invalid_keys:
            events.append(Event.fail(now, CONFIG_INVALID, {"invalid_keys": invalid_keys, "patch": patch}))
            return events

        for k, v in patch.items():
            setattr(self.cfg, k, v)
        tmp_cfg_path = f"{self.cfg.log_dir}/.config_runtime_tmp.json"
        save_config(self.cfg, tmp_cfg_path)
        normalized_cfg = load_config(tmp_cfg_path)
        for k, v in asdict(normalized_cfg).items():
            setattr(self.cfg, k, v)
        Path(tmp_cfg_path).unlink(missing_ok=True)

        events.append(Event.config_changed(now, "CONFIG_UPDATED", {"patch": patch, "config": asdict(self.cfg)}))

        try:
            save_config(self.cfg, f"{self.cfg.log_dir}/config.json")
        except Exception as e:
            events.append(Event.fail(time.time(), CONFIG_PERSIST_FAIL, {"error": str(e)}))

        events.extend(self.logger.log_config(self.cfg))
        return events

    def _serial_source(self) -> SerialSource | None:
        if str(self.cfg.source_type) != "SERIAL":
            return None
        src = self.source
        if isinstance(src, SerialSource):
            return src
        return None

    def serial_list_ports(self) -> list[str]:
        src = self._serial_source()
        if src is None:
            return []
        return src.list_ports()

    def serial_connect(self) -> bool:
        src = self._serial_source()
        if src is None:
            return False
        return bool(src.connect())

    def serial_disconnect(self) -> bool:
        src = self._serial_source()
        if src is None:
            return False
        return bool(src.disconnect())

    def serial_reconnect(self) -> bool:
        src = self._serial_source()
        if src is None:
            return False
        return bool(src.reconnect())

    def serial_test_device(self) -> dict:
        src = self._serial_source()
        if src is None:
            return {"success": False, "error": "not_serial_source"}
        result = src.test_device()
        return {
            "success": result.success,
            "device": result.device,
            "protocol": result.protocol,
            "fields": result.fields,
            "rate_hz": result.rate_hz,
            "raw_response": result.raw_response,
            "error": result.error,
        }

    def get_source_diagnostics(self) -> dict:
        base = {
            "source_type": str(self.cfg.source_type),
            "source_status": self._source_status,
            "serial_ports": [],
        }
        src = self._serial_source()
        if src is not None:
            diag = src.get_diagnostics()
            diag["serial_ports"] = src.list_ports()
            diag["source_type"] = "SERIAL"
            diag["source_status"] = self._source_status
            return diag
        if hasattr(self.source, "get_diagnostics"):
            diag = dict(getattr(self.source, "get_diagnostics")())
            diag["source_status"] = self._source_status
            return {**base, **diag}
        return base

    def _source_observability(self, sample, now: float) -> tuple[list[Event], str]:
        events: list[Event] = []
        new_status = "OK"
        serial_diag: dict | None = None

        src = self._serial_source()
        if src is not None:
            serial_diag = src.get_diagnostics()
            read_state = str(serial_diag.get("last_read_state", ""))
            conn_state = str(serial_diag.get("connection_state", "DISCONNECTED"))
            if conn_state in ("DISCONNECTED", "ERROR", "UNAVAILABLE"):
                new_status = "DOWN"
            elif read_state == "INFRA_ERROR":
                new_status = "DOWN"
            elif read_state == "PARSE_ERROR":
                new_status = "DEGRADED"
            elif read_state == "NO_DATA":
                new_status = "TIMEOUT"
            elif read_state == "VALID":
                new_status = "OK"
            else:
                new_status = "TIMEOUT" if sample is None else "OK"
        else:
            generic_diag = {}
            if hasattr(self.source, "get_diagnostics"):
                generic_diag = dict(getattr(self.source, "get_diagnostics")())
            read_state = str(generic_diag.get("last_read_state", ""))
            if read_state == "INFRA_ERROR":
                new_status = "DOWN"
            elif read_state == "PARSE_ERROR":
                new_status = "DEGRADED"
            elif read_state == "NO_DATA":
                new_status = "TIMEOUT"
            elif read_state == "VALID":
                new_status = "OK"
            else:
                flags = {str(f).upper() for f in (sample.flags if sample else [])}
                if sample is None:
                    new_status = "TIMEOUT"
                elif "SOURCE_UNAVAILABLE" in flags:
                    new_status = "DOWN"
                elif "PARSE_FAIL" in flags:
                    new_status = "DEGRADED"

        if sample is not None and new_status == "OK":
            self._last_good_sample_wall_ts = now

        if self._source_status != new_status and new_status in ("TIMEOUT", "DOWN") and self._allow_source_event("SOURCE_TIMEOUT", now, self.cfg.min_event_interval_sec):
            events.append(Event(ts=now, kind="SOURCE_TIMEOUT", message="SOURCE_TIMEOUT", payload={"source_type": self.cfg.source_type}))

        if self._source_status in ("TIMEOUT", "DOWN", "DEGRADED") and new_status == "OK":
            if self._allow_source_event("SOURCE_RECOVERY", now, self.cfg.min_event_interval_sec):
                events.append(Event(ts=now, kind="SOURCE_RECOVERY", message="SOURCE_RECOVERY", payload={"source_type": self.cfg.source_type}))

        if serial_diag is not None:
            parse_streak = int(serial_diag.get("parse_fail_streak", 0))
            if str(serial_diag.get("last_read_state", "")) == "PARSE_ERROR" and parse_streak >= 3:
                if self._allow_source_event("SERIAL_PARSE_FAIL_PERSISTENT", now, self.cfg.min_event_interval_sec):
                    events.append(
                        Event(
                            ts=now,
                            kind="SERIAL_PARSE_FAIL_PERSISTENT",
                            message="SERIAL_PARSE_FAIL_PERSISTENT",
                            payload={"parse_fail_streak": parse_streak},
                        )
                    )

        if hasattr(self.source, "ended") and bool(getattr(self.source, "ended", False)) and not self._replay_end_emitted:
            self._replay_end_emitted = True
            events.append(Event(ts=now, kind="REPLAY_END", message="REPLAY_END", payload={"source_type": self.cfg.source_type}))

        self._source_status = new_status
        return events, new_status

    def tick(self) -> RuntimeSnapshot:
        events: list[Event] = []
        events.extend(self.logger.drain_init_errors())

        sample = None
        try:
            sample = self.source.read()
        except Exception as e:
            events.append(Event.fail(time.time(), f"SOURCE_FAIL: {e}"))

        now = time.time()
        source_events, source_status = self._source_observability(sample, now)
        events.extend(source_events)

        validated = self.validator.validate(sample, self._last_ts, self.cfg)
        if validated.sample:
            self._last_ts = validated.sample.ts

        status, engine_events = self.engine.step(validated, self.cfg)
        events.extend(engine_events)

        self.dataset.add(validated)
        window = self.dataset.metrics(now_ts=validated.now_ts)
        if bool(self.cfg.anomaly_enabled):
            anomaly_result = self.anomaly.evaluate(
                metrics=window,
                data_quality=validated.data_quality,
                flow_state=str(status.flow_state),
                latest_flags=self.dataset.latest_flags(),
                anomaly_threshold=float(self.cfg.anomaly_threshold),
            )
        else:
            anomaly_result = AnomalyResult(score=0.0, state="DISABLED", reasons=["ANOMALY_DISABLED"])
        policy_result = self.policy.decide(
            engine_state=str(status.state),
            data_quality=validated.data_quality,
            anomaly=anomaly_result,
            metrics=window,
            anomaly_enabled=bool(self.cfg.anomaly_enabled),
        )

        if bool(self.cfg.anomaly_enabled) and anomaly_result.state in ("ATTENTION", "ANOMALY") and policy_result.maybe_emit_event:
            events.append(
                Event(
                    ts=now,
                    kind="ANOMALY",
                    message="ANOMALY",
                    payload={
                        "score": round(anomaly_result.score, 3),
                        "state": anomaly_result.state,
                        "reasons": anomaly_result.reasons,
                    },
                )
            )

        if policy_result.decision == "BLOCK":
            events.append(
                Event(
                    ts=now,
                    kind="POLICY_BLOCK",
                    message="POLICY_BLOCK",
                    payload={"reasons": policy_result.reasons},
                )
            )

        actuation_outcome = self.actuator.apply(
            now_ts=now,
            allow_actuation=policy_result.allow_actuation,
            decision=policy_result.decision,
            reasons=policy_result.reasons,
        )
        events.extend(actuation_outcome.events)

        last_sample_age_sec = None
        if self._last_good_sample_wall_ts is not None:
            last_sample_age_sec = max(0.0, now - self._last_good_sample_wall_ts)

        status.source_type = str(self.cfg.source_type)
        status.source_status = source_status
        status.last_sample_age_sec = last_sample_age_sec
        status.data_validity_hint = "VALID" if validated.data_quality == "GOOD" else ("MISSING" if validated.data_quality == "MISSING" else "NOISY")
        status.anomaly_score = (anomaly_result.score if bool(self.cfg.anomaly_enabled) else None)
        status.anomaly_state = anomaly_result.state
        policy_view = policy_result.decision
        if not bool(self.cfg.actuation_enabled):
            policy_view = f"{policy_view}_ACT_DISABLED"
        elif str(self.cfg.actuation_mode) != "AUTO" and policy_result.allow_actuation:
            policy_view = f"{policy_view}_MANUAL_MODE"
        status.policy_decision = policy_view
        status.actuation_state = actuation_outcome.state

        if validated.sample is not None:
            events.extend(self.logger.log_sample(validated.sample))

        if events:
            events.extend(self.logger.log_events(events))

        return RuntimeSnapshot(latest_sample=validated.sample, events=events, status=status)
