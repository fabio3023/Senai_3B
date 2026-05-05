from __future__ import annotations

from dataclasses import dataclass

from system.core.models import Config, Event


@dataclass(slots=True)
class ActuationOutcome:
    state: str
    events: list[Event]


class SafetyActuator:
    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg
        self.state: str = "OFF"
        self._locked_until_ts: float = 0.0
        self._last_on_ts: float | None = None
        self._last_off_ts: float = 0.0

    def safety_stop(self, now_ts: float, reason: str = "SAFETY_STOP") -> list[Event]:
        self.state = "LOCKED"
        self._locked_until_ts = max(self._locked_until_ts, now_ts + float(self.cfg.cooldown_sec))
        self._last_off_ts = now_ts
        return [Event(ts=now_ts, kind="SAFETY_STOP", message="SAFETY_STOP", payload={"reason": reason, "state": self.state})]

    def apply(self, now_ts: float, allow_actuation: bool, decision: str, reasons: list[str]) -> ActuationOutcome:
        events: list[Event] = []

        if self.state == "LOCKED" and now_ts >= self._locked_until_ts:
            self.state = "OFF"
        elif self.state == "LOCKED":
            return ActuationOutcome(state=self.state, events=events)

        if self.state == "ON":
            on_anchor = self._last_on_ts if self._last_on_ts is not None else now_ts
            on_for = now_ts - float(on_anchor)
            if on_for >= float(self.cfg.max_on_sec):
                events.extend(self.safety_stop(now_ts, reason="MAX_ON_EXCEEDED"))
                return ActuationOutcome(state=self.state, events=events)

        if decision == "BLOCK":
            if self.state == "ON":
                events.extend(self.safety_stop(now_ts, reason="POLICY_BLOCK"))
            return ActuationOutcome(state=self.state, events=events)

        if not bool(self.cfg.actuation_enabled):
            if self.state == "ON":
                events.extend(self.safety_stop(now_ts, reason="ACTUATION_DISABLED"))
            return ActuationOutcome(state=self.state, events=events)

        if allow_actuation and self.cfg.actuation_mode == "AUTO":
            if self.state == "OFF":
                off_for = now_ts - self._last_off_ts
                if off_for >= float(self.cfg.min_off_sec):
                    self.state = "ON"
                    self._last_on_ts = now_ts
                    events.append(Event(ts=now_ts, kind="ACTUATION_ON", message="ACTUATION_ON", payload={"decision": decision, "reasons": reasons}))
        else:
            if self.state == "ON":
                self.state = "OFF"
                self._last_off_ts = now_ts
                events.append(Event(ts=now_ts, kind="ACTUATION_OFF", message="ACTUATION_OFF", payload={"decision": decision, "reasons": reasons}))

        return ActuationOutcome(state=self.state, events=events)
