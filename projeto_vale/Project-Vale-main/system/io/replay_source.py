from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import time

from system.core.models import Config, Sample
from system.io.serial_source import SerialSource


@dataclass
class ReplaySource:
    cfg: Config
    source_id: str = "REPLAY"

    def __post_init__(self) -> None:
        self._line_parser = SerialSource(self.cfg, source_id=self.source_id)
        self._raw_lines = self._load_raw_lines(Path(self.cfg.replay_path)) if self.cfg.replay_path else []
        self._i = 0
        self.ended = False
        self._last_ts = time.time()
        self._load_error = ""
        self._last_read_state = "NO_DATA"
        self._last_failure_cause = "replay_not_started"
        self._last_raw_line = ""
        self._line_count = 0
        self._parse_fail_count = 0
        self._last_parse_error = ""
        if self.cfg.replay_path and not self._raw_lines:
            path = Path(self.cfg.replay_path)
            if not path.exists() or not path.is_file():
                self._load_error = "replay_file_unavailable"
                self._last_read_state = "INFRA_ERROR"
                self._last_failure_cause = "replay_file_unavailable"

    def _load_raw_lines(self, path: Path) -> list[bytes]:
        if not path.exists() or not path.is_file():
            return []
        return path.read_bytes().splitlines()

    def read(self) -> Sample | None:
        dt = max(0.01, float(self.cfg.sample_period_ms) / 1000.0)
        now = time.time()
        to_sleep = dt - (now - self._last_ts)
        if to_sleep > 0:
            time.sleep(to_sleep)
        self._last_ts = time.time()

        if self._load_error:
            self._last_read_state = "INFRA_ERROR"
            self._last_failure_cause = self._load_error
            return None

        if not self._raw_lines:
            self.ended = True
            self._last_read_state = "NO_DATA"
            self._last_failure_cause = "replay_empty"
            return None

        if self._i >= len(self._raw_lines):
            if self.cfg.replay_loop:
                self._i = 0
            else:
                self.ended = True
                self._last_read_state = "NO_DATA"
                self._last_failure_cause = "replay_end"
                return None

        raw_line = self._raw_lines[self._i]
        self._i += 1
        self._line_count += 1

        try:
            line = raw_line.decode("utf-8", errors="strict").strip()
        except Exception:
            self._parse_fail_count += 1
            self._last_raw_line = raw_line.decode("utf-8", errors="replace").strip() or repr(raw_line)
            self._last_parse_error = "utf8_decode_error"
            self._last_read_state = "PARSE_ERROR"
            self._last_failure_cause = "line_decode_failed"
            return None

        self._last_raw_line = line
        if not line:
            self._last_read_state = "NO_DATA"
            self._last_failure_cause = "empty_line"
            return None

        try:
            sample = self._line_parser.parse_text_line(line, source_id=self.source_id)
        except Exception as exc:
            self._parse_fail_count += 1
            self._last_parse_error = str(exc)
            self._last_read_state = "PARSE_ERROR"
            self._last_failure_cause = "line_malformed"
            return None

        self._last_parse_error = ""
        self._last_failure_cause = ""
        self._last_read_state = "VALID"
        return sample

    def get_diagnostics(self) -> dict:
        return {
            "last_read_state": self._last_read_state,
            "last_failure_cause": self._last_failure_cause,
            "last_raw_line": self._last_raw_line,
            "line_count": int(self._line_count),
            "parse_fail_count": int(self._parse_fail_count),
            "last_parse_error": self._last_parse_error,
            "source_type": "REPLAY",
            "replay_ended": bool(self.ended),
            "replay_path": str(self.cfg.replay_path or ""),
        }
