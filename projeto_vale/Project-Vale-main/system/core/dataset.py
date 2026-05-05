from __future__ import annotations

from collections import deque
from dataclasses import dataclass

from system.core.models import Validated


@dataclass(slots=True)
class WindowEntry:
    ts: float
    humidity: float | None
    distance_mm: float | None
    level_pct: float | None
    flags: tuple[str, ...]
    data_quality: str


@dataclass(slots=True)
class WindowMetrics:
    size: int
    valid_count: int
    invalid_count: int
    latest_distance_mm: float | None
    latest_level_pct: float | None
    delta_distance_mm: float | None
    delta_level_pct: float | None
    rate_distance_mm_per_sec: float | None
    time_since_relevant_change_sec: float | None


class OperationalDataset:
    def __init__(self, maxlen: int = 40, relevant_change_epsilon_mm: float = 1.5) -> None:
        self.maxlen = max(5, int(maxlen))
        self._epsilon = max(0.0, float(relevant_change_epsilon_mm))
        self._entries: deque[WindowEntry] = deque(maxlen=self.maxlen)
        self._last_relevant_change_ts: float | None = None

    def add(self, validated: Validated) -> None:
        sample = validated.sample
        entry = WindowEntry(
            ts=float(validated.now_ts),
            humidity=(None if sample is None else sample.humidity),
            distance_mm=(None if sample is None else sample.distance_mm),
            level_pct=(None if sample is None else sample.level_pct),
            flags=tuple(str(f) for f in (sample.flags if sample else [])),
            data_quality=str(validated.data_quality),
        )

        prev = self._entries[-1] if self._entries else None
        if prev is None:
            self._last_relevant_change_ts = entry.ts
        elif entry.distance_mm is not None and prev.distance_mm is not None:
            if abs(float(entry.distance_mm) - float(prev.distance_mm)) >= self._epsilon:
                self._last_relevant_change_ts = entry.ts

        self._entries.append(entry)

    def metrics(self, now_ts: float) -> WindowMetrics:
        rows = list(self._entries)
        if not rows:
            return WindowMetrics(
                size=0,
                valid_count=0,
                invalid_count=0,
                latest_distance_mm=None,
                latest_level_pct=None,
                delta_distance_mm=None,
                delta_level_pct=None,
                rate_distance_mm_per_sec=None,
                time_since_relevant_change_sec=None,
            )

        valid_count = sum(1 for r in rows if r.data_quality == "GOOD")
        invalid_count = len(rows) - valid_count

        first = rows[0]
        last = rows[-1]
        delta_distance_mm = None
        if first.distance_mm is not None and last.distance_mm is not None:
            delta_distance_mm = float(last.distance_mm) - float(first.distance_mm)

        delta_level_pct = None
        if first.level_pct is not None and last.level_pct is not None:
            delta_level_pct = float(last.level_pct) - float(first.level_pct)

        rate = None
        if delta_distance_mm is not None:
            dt = max(0.001, float(last.ts) - float(first.ts))
            rate = float(delta_distance_mm) / dt

        since_change = None
        if self._last_relevant_change_ts is not None:
            since_change = max(0.0, float(now_ts) - float(self._last_relevant_change_ts))

        return WindowMetrics(
            size=len(rows),
            valid_count=valid_count,
            invalid_count=invalid_count,
            latest_distance_mm=last.distance_mm,
            latest_level_pct=last.level_pct,
            delta_distance_mm=delta_distance_mm,
            delta_level_pct=delta_level_pct,
            rate_distance_mm_per_sec=rate,
            time_since_relevant_change_sec=since_change,
        )

    def latest_flags(self) -> list[str]:
        if not self._entries:
            return []
        return list(self._entries[-1].flags)
