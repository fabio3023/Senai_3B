from __future__ import annotations

from dataclasses import dataclass, field

from system.core.anomaly import AnomalyResult
from system.core.dataset import WindowMetrics


@dataclass(slots=True)
class PolicyDecision:
    decision: str
    reasons: list[str] = field(default_factory=list)
    allow_actuation: bool = False
    maybe_emit_event: bool = False


class SafetyPolicy:
    def decide(self, engine_state: str, data_quality: str, anomaly: AnomalyResult, metrics: WindowMetrics, anomaly_enabled: bool) -> PolicyDecision:
        reasons: list[str] = []

        if data_quality in ("MISSING", "NOISY"):
            reasons.append("BLOCK_BAD_DATA")
            return PolicyDecision(
                decision="OBSERVE",
                reasons=reasons,
                allow_actuation=False,
                maybe_emit_event=bool(anomaly_enabled and anomaly.state != "NORMAL"),
            )

        if anomaly_enabled and anomaly.state == "ANOMALY":
            reasons.extend(anomaly.reasons)
            reasons.append("POLICY_BLOCK_ANOMALY")
            return PolicyDecision(
                decision="BLOCK",
                reasons=reasons,
                allow_actuation=False,
                maybe_emit_event=True,
            )

        if engine_state == "ALERT" and (not anomaly_enabled or anomaly.state == "NORMAL"):
            reasons.append("ALERT_AND_CLEAN_DATA")
            enough_window = metrics.size >= 6 and metrics.valid_count >= 4
            return PolicyDecision(
                decision="ALLOW_ACTUATION" if enough_window else "OBSERVE",
                reasons=reasons,
                allow_actuation=bool(enough_window),
                maybe_emit_event=False,
            )

        if anomaly_enabled and anomaly.state == "ATTENTION":
            reasons.extend(anomaly.reasons)
            return PolicyDecision(
                decision="SIGNAL",
                reasons=reasons,
                allow_actuation=False,
                maybe_emit_event=True,
            )

        return PolicyDecision(decision="OBSERVE", reasons=["NOMINAL"], allow_actuation=False, maybe_emit_event=False)
