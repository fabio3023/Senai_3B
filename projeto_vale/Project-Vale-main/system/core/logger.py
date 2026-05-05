from __future__ import annotations

import csv
from dataclasses import asdict
import json
from pathlib import Path
import time

from system.core.models import Config, Event, Sample


class EvidenceLogger:
    def __init__(self, log_dir: str = "data") -> None:
        self.log_dir = Path(log_dir)
        self.samples_path = self.log_dir / "samples.csv"
        self.events_path = self.log_dir / "events.csv"
        self.config_path = self.log_dir / "config.json"

        self._init_errors: list[Event] = []
        try:
            self.log_dir.mkdir(parents=True, exist_ok=True)
            self._ensure_headers()
        except Exception as e:
            self._init_errors.append(self._fail_event("init", e, ts=time.time()))

    def _fail_event(self, op: str, error: Exception, ts: float) -> Event:
        return Event.fail(ts, "LOGGER_WRITE_FAIL", {"op": op, "error": str(error)})

    def drain_init_errors(self) -> list[Event]:
        errors = list(self._init_errors)
        self._init_errors.clear()
        return errors

    def _ensure_headers(self) -> None:
        if not self.samples_path.exists():
            with self.samples_path.open("w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["ts", "humidity", "temp", "distance_mm", "level_pct", "weight", "source_id", "flags"])

        if not self.events_path.exists():
            with self.events_path.open("w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["ts", "kind", "message", "payload_json"])

    def log_sample(self, s: Sample) -> list[Event]:
        try:
            with self.samples_path.open("a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow([s.ts, s.humidity, s.temp, s.distance_mm, s.level_pct, s.weight, s.source_id, "|".join(s.flags)])
            return []
        except Exception as e:
            return [self._fail_event("log_sample", e, ts=s.ts)]

    def log_events(self, events: list[Event]) -> list[Event]:
        try:
            with self.events_path.open("a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                for e in events:
                    w.writerow([e.ts, e.kind, e.message, json.dumps(e.payload, ensure_ascii=False)])
            return []
        except Exception as e:
            ts = events[-1].ts if events else time.time()
            return [self._fail_event("log_events", e, ts=ts)]

    def log_config(self, cfg: Config) -> list[Event]:
        try:
            self.config_path.write_text(json.dumps(asdict(cfg), indent=2, ensure_ascii=False), encoding="utf-8")
            return []
        except Exception as e:
            return [self._fail_event("log_config", e, ts=time.time())]
