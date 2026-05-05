from __future__ import annotations

from system.core.models import (
    ANTISPAM_SUPPRESS,
    Config,
    ENTER_ALERT,
    ENTER_PRE,
    Event,
    EXIT_ALERT,
    EXIT_PRE,
    FLOW_CHANGED,
    FLOW_RECOVERED,
    FLOW_STALL,
    StatusSnapshot,
    Validated,
)


class Engine:
    def __init__(self, cfg: Config) -> None:
        del cfg
        self.state: str = "OK"
        self._pre_start: float | None = None
        self._alert_start: float | None = None
        self._clear_start: float | None = None
        self._last_event_ts_by_kind: dict[str, float] = {}

        self._flow_state: str = "NORMAL"
        self._last_distance_mm: float | None = None
        self._last_distance_ts: float | None = None
        self._last_level_change_ts: float | None = None
        self._stall_start_ts: float | None = None
        self._flow_rate_hint: float | None = None

    def _allow_event(self, ts: float, kind: str, min_interval: float) -> bool:
        last = self._last_event_ts_by_kind.get(kind)
        if last is not None and (ts - last) < min_interval:
            return False
        self._last_event_ts_by_kind[kind] = ts
        return True

    def _transition_event(self, ts: float, kind: str, state_from: str, state_to: str, humidity: float, payload: dict) -> Event:
        data = {"state_from": state_from, "state_to": state_to, "humidity": humidity}
        data.update(payload)
        return Event(ts=ts, kind=kind, message=kind, payload=data)

    def _distance_to_level_pct(self, distance_mm: float, cfg: Config) -> float:
        span = max(1.0, float(cfg.distance_empty_mm) - float(cfg.distance_full_mm))
        pct = 100.0 * (float(cfg.distance_empty_mm) - float(distance_mm)) / span
        return max(0.0, min(100.0, pct))

    def _emit_flow_transition(self, ts: float, new_state: str, stall_sec: float, cfg: Config, reasons: list[str]) -> list[Event]:
        if new_state == self._flow_state:
            return []

        events: list[Event] = []
        state_from = self._flow_state
        self._flow_state = new_state
        reasons.append(FLOW_CHANGED)
        if new_state != "NORMAL":
            reasons.append(FLOW_STALL)

        kind_map = {
            "ATTENTION": "FLOW_ATTENTION_ON",
            "ANOMALY": "FLOW_ANOMALY_ON",
            "CHOKE": "FLOW_CHOKE_ON",
            "NORMAL": "FLOW_RECOVERY",
        }
        kind = kind_map[new_state]
        payload = {
            "flow_state_from": state_from,
            "flow_state_to": new_state,
            "stall_sec": round(stall_sec, 3),
            "epsilon_mm": float(cfg.level_stall_epsilon_mm),
        }
        if self._allow_event(ts, kind, cfg.min_event_interval_sec):
            events.append(Event(ts=ts, kind=kind, message=kind, payload=payload))
        else:
            reasons.append(ANTISPAM_SUPPRESS)

        if new_state == "NORMAL":
            reasons.append(FLOW_RECOVERED)

        return events

    def _evaluate_flow(self, validated: Validated, cfg: Config, reasons: list[str]) -> tuple[list[Event], float | None, float | None, float | None, str]:
        events: list[Event] = []
        ts = validated.now_ts

        sample = validated.sample
        distance = sample.distance_mm if sample else None
        level_pct = sample.level_pct if sample else None

        if sample and distance is not None and level_pct is None:
            level_pct = self._distance_to_level_pct(distance, cfg)
            sample.level_pct = level_pct

        if distance is None:
            self._last_distance_mm = None
            self._last_distance_ts = None
            self._stall_start_ts = None
            self._flow_rate_hint = None
            self._flow_state = "NORMAL"
            return events, None, level_pct, self._flow_rate_hint, self._flow_state

        if self._last_distance_mm is None:
            self._last_distance_mm = float(distance)
            self._last_distance_ts = ts
            self._last_level_change_ts = ts
            self._stall_start_ts = None
            return events, float(distance), level_pct, self._flow_rate_hint, self._flow_state

        delta_mm = float(distance) - float(self._last_distance_mm)
        dt = max(0.001, ts - (self._last_distance_ts or ts))
        self._flow_rate_hint = abs(delta_mm) / dt

        if abs(delta_mm) >= float(cfg.level_stall_epsilon_mm):
            self._last_level_change_ts = ts
            self._stall_start_ts = None
            events.extend(self._emit_flow_transition(ts, "NORMAL", 0.0, cfg, reasons))
        else:
            self._stall_start_ts = self._stall_start_ts or ts
            stall_sec = max(0.0, ts - self._stall_start_ts)
            if stall_sec >= float(cfg.choke_stall_sec):
                events.extend(self._emit_flow_transition(ts, "CHOKE", stall_sec, cfg, reasons))
            elif stall_sec >= float(cfg.anomaly_stall_sec):
                events.extend(self._emit_flow_transition(ts, "ANOMALY", stall_sec, cfg, reasons))
            elif stall_sec >= float(cfg.attention_stall_sec):
                events.extend(self._emit_flow_transition(ts, "ATTENTION", stall_sec, cfg, reasons))

        self._last_distance_mm = float(distance)
        self._last_distance_ts = ts
        return events, float(distance), level_pct, self._flow_rate_hint, self._flow_state if self._flow_state else "NORMAL"

    def step(self, validated: Validated, cfg: Config) -> tuple[StatusSnapshot, list[Event]]:
        events: list[Event] = []
        ts = validated.now_ts
        limit = float(cfg.humidity_limit)
        pre_limit = limit * (1.0 - float(cfg.pre_margin_pct) / 100.0)
        off_limit = limit * (1.0 - float(cfg.hysteresis_pct) / 100.0)

        h = validated.sample.humidity if validated.sample else None
        reasons = list(validated.reasons)
        level = "WARN" if validated.data_quality in ("NOISY", "MISSING") else "OK"

        flow_events, latest_distance, latest_level_pct, flow_rate_hint, flow_state = self._evaluate_flow(validated, cfg, reasons)
        events.extend(flow_events)

        if h is None:
            status = StatusSnapshot(
                level="WARN" if self.state != "ALERT" else "ALERT",
                state=self.state,
                reasons=reasons,
                humidity_limit=limit,
                pre_limit=pre_limit,
                latest_humidity=None,
                latest_weight=None,
                latest_distance_mm=latest_distance,
                latest_level_pct=latest_level_pct,
                flow_rate_hint=flow_rate_hint,
                flow_state=flow_state,
                time_since_level_change_sec=(ts - self._last_level_change_ts) if self._last_level_change_ts else None,
                data_quality=validated.data_quality,
            )
            return status, events

        if self.state == "OK":
            if h >= pre_limit:
                self._pre_start = self._pre_start or ts
                if (ts - self._pre_start) >= cfg.persistence_sec:
                    state_from = self.state
                    self.state = "PRE_ALERT"
                    self._pre_start = None
                    self._alert_start = None
                    self._clear_start = None
                    reasons.append(ENTER_PRE)
                    if self._allow_event(ts, "PRE_ALERT_ON", cfg.min_event_interval_sec):
                        events.append(self._transition_event(ts, "PRE_ALERT_ON", state_from, "PRE_ALERT", h, {"pre_limit": pre_limit, "limit": limit}))
                    else:
                        reasons.append(ANTISPAM_SUPPRESS)
            else:
                self._pre_start = None

        elif self.state == "PRE_ALERT":
            if h >= limit:
                self._alert_start = self._alert_start or ts
                if (ts - self._alert_start) >= cfg.persistence_sec:
                    state_from = self.state
                    self.state = "ALERT"
                    self._alert_start = None
                    self._clear_start = None
                    reasons.extend([EXIT_PRE, ENTER_ALERT])
                    if self._allow_event(ts, "PRE_ALERT_OFF", cfg.min_event_interval_sec):
                        events.append(self._transition_event(ts, "PRE_ALERT_OFF", state_from, "ALERT", h, {"pre_limit": pre_limit, "limit": limit}))
                    else:
                        reasons.append(ANTISPAM_SUPPRESS)
                    if self._allow_event(ts, "ALERT_ON", cfg.min_event_interval_sec):
                        events.append(self._transition_event(ts, "ALERT_ON", state_from, "ALERT", h, {"limit": limit, "off_limit": off_limit}))
                    else:
                        reasons.append(ANTISPAM_SUPPRESS)
            else:
                self._alert_start = None

            if h < pre_limit:
                state_from = self.state
                self.state = "OK"
                self._pre_start = None
                self._alert_start = None
                self._clear_start = None
                reasons.append(EXIT_PRE)
                if self._allow_event(ts, "PRE_ALERT_OFF", cfg.min_event_interval_sec):
                    events.append(self._transition_event(ts, "PRE_ALERT_OFF", state_from, "OK", h, {"pre_limit": pre_limit, "limit": limit}))
                else:
                    reasons.append(ANTISPAM_SUPPRESS)

        elif self.state == "ALERT":
            level = "ALERT"
            if h <= off_limit:
                self._clear_start = self._clear_start or ts
                if (ts - self._clear_start) >= cfg.persistence_sec:
                    state_from = self.state
                    self.state = "OK"
                    self._clear_start = None
                    reasons.append(EXIT_ALERT)
                    if self._allow_event(ts, "ALERT_OFF", cfg.min_event_interval_sec):
                        events.append(self._transition_event(ts, "ALERT_OFF", state_from, "OK", h, {"off_limit": off_limit, "limit": limit}))
                    else:
                        reasons.append(ANTISPAM_SUPPRESS)
            else:
                self._clear_start = None

        if self.state == "ALERT":
            level = "ALERT"
        elif level == "WARN":
            level = "WARN"
        elif flow_state in ("ANOMALY", "CHOKE"):
            level = "WARN"
        else:
            level = "OK"

        status = StatusSnapshot(
            level=level,
            state=self.state,
            reasons=reasons,
            humidity_limit=limit,
            pre_limit=pre_limit,
            latest_humidity=h,
            latest_weight=validated.sample.weight if validated.sample else None,
            latest_distance_mm=latest_distance,
            latest_level_pct=latest_level_pct,
            flow_state=flow_state,
            flow_rate_hint=flow_rate_hint,
            time_since_level_change_sec=(ts - self._last_level_change_ts) if self._last_level_change_ts else None,
            data_quality=validated.data_quality,
        )
        return status, events
