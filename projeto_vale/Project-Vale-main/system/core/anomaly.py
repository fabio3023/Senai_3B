from __future__ import annotations

from dataclasses import dataclass, field

from system.core.dataset import WindowMetrics


@dataclass(slots=True)
class AnomalyResult:
    score: float
    state: str
    reasons: list[str] = field(default_factory=list)


class AnomalyDetector:
    def evaluate(self, metrics: WindowMetrics, data_quality: str, flow_state: str, latest_flags: list[str], anomaly_threshold: float) -> AnomalyResult:
        score = 0.0
        reasons: list[str] = []

        if metrics.size < 4:
            return AnomalyResult(score=0.0, state="NORMAL", reasons=[])

        if data_quality in ("NOISY", "MISSING"):
            score += 0.25
            reasons.append("DATA_QUALITY_DEGRADED")

        if metrics.invalid_count >= max(2, metrics.size // 3):
            score += 0.2
            reasons.append("WINDOW_INVALID_RATIO_HIGH")

        stalled = (
            metrics.time_since_relevant_change_sec is not None
            and metrics.time_since_relevant_change_sec >= 10.0
            and metrics.rate_distance_mm_per_sec is not None
            and abs(metrics.rate_distance_mm_per_sec) < 0.2
        )
        if stalled:
            score += 0.35
            reasons.append("SENSOR_STUCK_SUSPECT")

        if flow_state in ("ANOMALY", "CHOKE"):
            score += 0.25
            reasons.append(f"FLOW_{flow_state}")

        impossible_signal = any(
            flag in {"DIST_OUT_OF_RANGE", "DIST_PARSE_FAIL", "OUT_OF_RANGE", "PARSE_FAIL"} for flag in latest_flags
        )
        if impossible_signal:
            score += 0.2
            reasons.append("IMPOSSIBLE_SIGNAL")

        score = max(0.0, min(1.0, score))
        threshold = max(0.1, min(1.0, float(anomaly_threshold)))
        attention_threshold = max(0.1, min(threshold, threshold * 0.6))
        state = "ANOMALY" if score >= threshold else ("ATTENTION" if score >= attention_threshold else "NORMAL")
        return AnomalyResult(score=score, state=state, reasons=reasons)
