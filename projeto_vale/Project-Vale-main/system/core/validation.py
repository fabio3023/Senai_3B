from __future__ import annotations

import time

from system.core.models import (
    Config,
    DATA_MISSING,
    DIST_BAD_TYPE,
    DIST_MISSING,
    DIST_OOR,
    DROPOUT,
    HUM_OOR,
    PARSE_FAIL,
    Sample,
    TS_REGRESS,
    Validated,
)


class Validator:
    def validate(self, sample: Sample | None, last_ts: float | None, cfg: Config) -> Validated:
        now = sample.ts if sample is not None else time.time()
        reasons: list[str] = []

        if sample is None:
            return Validated(sample=None, data_quality="MISSING", reasons=[DATA_MISSING, DROPOUT], now_ts=now)

        if last_ts is not None and sample.ts < last_ts:
            reasons.append(TS_REGRESS)

        hum_min = float(getattr(cfg, "humidity_min_valid", 0.0))
        hum_max = float(getattr(cfg, "humidity_max_valid", 100.0))
        if sample.humidity < hum_min or sample.humidity > hum_max:
            sample.flags.append("OUT_OF_RANGE")
            reasons.append(HUM_OOR)

        if sample.distance_mm is None:
            sample.flags.append("DIST_MISSING")
            reasons.append(DIST_MISSING)
        else:
            try:
                dist = float(sample.distance_mm)
                sample.distance_mm = dist
                dist_min = float(getattr(cfg, "distance_min_valid", 0.0))
                dist_max = float(getattr(cfg, "distance_max_valid", max(float(cfg.distance_empty_mm) * 1.6, 3000.0)))
                if dist_max <= dist_min:
                    dist_max = dist_min + 1.0
                if dist < dist_min or dist > dist_max:
                    sample.flags.append("DIST_OUT_OF_RANGE")
                    reasons.append(DIST_OOR)
            except (TypeError, ValueError):
                sample.flags.append("DIST_PARSE_FAIL")
                reasons.append(DIST_BAD_TYPE)
                sample.distance_mm = None

        if sample.level_pct is not None:
            try:
                sample.level_pct = max(0.0, min(100.0, float(sample.level_pct)))
            except (TypeError, ValueError):
                sample.flags.append("LEVEL_PARSE_FAIL")
                sample.level_pct = None

        upper_flags = {str(flag).upper() for flag in sample.flags}
        if "PARSE_FAIL" in upper_flags:
            reasons.append(PARSE_FAIL)

        if DATA_MISSING in reasons:
            dq = "MISSING"
        elif reasons:
            dq = "NOISY"
        else:
            dq = "GOOD"

        return Validated(sample=sample, data_quality=dq, reasons=reasons, now_ts=now)
