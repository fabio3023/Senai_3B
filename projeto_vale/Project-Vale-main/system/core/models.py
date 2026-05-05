from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal, Optional

DataQuality = Literal["GOOD", "NOISY", "MISSING"]
Level = Literal["OK", "WARN", "ALERT", "FAIL"]
State = Literal["OK", "PRE_ALERT", "ALERT"]
FlowState = Literal["NORMAL", "ATTENTION", "ANOMALY", "CHOKE"]
SourceHealth = Literal["OK", "DEGRADED", "TIMEOUT", "DOWN"]

EventKind = Literal[
    "PRE_ALERT_ON",
    "PRE_ALERT_OFF",
    "ALERT_ON",
    "ALERT_OFF",
    "WARN",
    "FAIL",
    "INFO",
    "CONFIG_CHANGED",
    "ACTUATION_ON",
    "ACTUATION_OFF",
    "POLICY_BLOCK",
    "SAFETY_STOP",
    "ANOMALY",
    "FLOW_ATTENTION_ON",
    "FLOW_ANOMALY_ON",
    "FLOW_CHOKE_ON",
    "FLOW_RECOVERY",
    "SOURCE_TIMEOUT",
    "SOURCE_RECOVERY",
    "SERIAL_PARSE_FAIL_PERSISTENT",
    "REPLAY_END",
]

SourceType = Literal["SIM", "SERIAL", "REPLAY"]

# Reason/status/event message codes (Fase 1)
DATA_MISSING = "DATA_MISSING"
TS_REGRESS = "TS_REGRESS"
HUM_OOR = "HUM_OOR"
DIST_MISSING = "DIST_MISSING"
DIST_OOR = "DIST_OOR"
DIST_BAD_TYPE = "DIST_BAD_TYPE"
LEVEL_COMPUTED = "LEVEL_COMPUTED"
FLOW_STALL = "FLOW_STALL"
FLOW_CHANGED = "FLOW_CHANGED"
FLOW_RECOVERED = "FLOW_RECOVERED"
PARSE_FAIL = "PARSE_FAIL"
DROPOUT = "DROPOUT"
ENTER_PRE = "ENTER_PRE"
EXIT_PRE = "EXIT_PRE"
ENTER_ALERT = "ENTER_ALERT"
EXIT_ALERT = "EXIT_ALERT"
ANTISPAM_SUPPRESS = "ANTISPAM_SUPPRESS"
LOGGER_WRITE_FAIL = "LOGGER_WRITE_FAIL"
CONFIG_INVALID = "CONFIG_INVALID"
CONFIG_PERSIST_FAIL = "CONFIG_PERSIST_FAIL"
SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE"


@dataclass(slots=True)
class Sample:
    ts: float
    humidity: float
    temp: Optional[float] = None
    distance_mm: Optional[float] = None
    level_pct: Optional[float] = None
    weight: Optional[float] = None
    source_id: str = "SIM"
    flags: list[str] = field(default_factory=list)


@dataclass(slots=True)
class Event:
    ts: float
    kind: EventKind
    message: str
    payload: dict[str, Any] = field(default_factory=dict)

    @staticmethod
    def info(ts: float, message: str, payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="INFO", message=message, payload=payload or {})

    @staticmethod
    def warn(ts: float, message: str, payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="WARN", message=message, payload=payload or {})

    @staticmethod
    def fail(ts: float, message: str, payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="FAIL", message=message, payload=payload or {})

    @staticmethod
    def alert_on(ts: float, message: str = "ALERT_ON", payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="ALERT_ON", message=message, payload=payload or {})

    @staticmethod
    def alert_off(ts: float, message: str = "ALERT_OFF", payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="ALERT_OFF", message=message, payload=payload or {})

    @staticmethod
    def config_changed(ts: float, message: str, payload: dict[str, Any] | None = None) -> "Event":
        return Event(ts=ts, kind="CONFIG_CHANGED", message=message, payload=payload or {})


@dataclass(slots=True)
class Config:
    humidity_limit: float = 80.0
    pre_margin_pct: float = 5.0
    persistence_sec: float = 3.0
    hysteresis_pct: float = 2.0
    min_event_interval_sec: float = 2.0
    sample_period_ms: int = 250
    log_dir: str = "data"
    source_type: SourceType = "SIM"
    serial_port: str = "COM3"
    baudrate: int = 115200
    serial_timeout_sec: float = 0.5
    replay_path: str = ""
    replay_loop: bool = True

    distance_empty_mm: float = 620.0
    distance_full_mm: float = 180.0
    level_stall_epsilon_mm: float = 1.5
    attention_stall_sec: float = 6.0
    anomaly_stall_sec: float = 12.0
    choke_stall_sec: float = 18.0

    # Perfil de entrada de dados (normalização leve para fontes variáveis)
    humidity_field_name: str = "humidity"
    distance_field_name: str = "distance_mm"
    temp_field_name: str = "temp"
    distance_unit: str = "mm"  # mm|cm|m|in
    distance_scale: float = 1.0
    distance_offset_mm: float = 0.0
    distance_clamp_enabled: bool = False
    distance_clamp_min_mm: float = 0.0
    distance_clamp_max_mm: float = 3000.0
    humidity_min_valid: float = 0.0
    humidity_max_valid: float = 100.0
    distance_min_valid: float = 0.0
    distance_max_valid: float = 3000.0
    serial_csv_order: str = "humidity,distance_mm,temp"
    serial_protocol_mode: str = "AUTO"  # AUTO|GENERIC_JSON|GENERIC_CSV|VALE_SENSOR_V1

    actuation_enabled: bool = False
    actuation_mode: Literal["MANUAL", "AUTO"] = "MANUAL"
    max_on_sec: float = 30.0
    min_off_sec: float = 10.0
    cooldown_sec: float = 5.0
    anomaly_enabled: bool = False
    anomaly_threshold: float = 0.8


@dataclass(slots=True)
class StatusSnapshot:
    level: Level
    state: State
    reasons: list[str]
    humidity_limit: float
    pre_limit: float
    latest_humidity: Optional[float]
    latest_weight: Optional[float]
    latest_distance_mm: Optional[float] = None
    latest_level_pct: Optional[float] = None
    flow_state: FlowState = "NORMAL"
    flow_rate_hint: Optional[float] = None
    time_since_level_change_sec: Optional[float] = None
    source_type: str = "SIM"
    source_status: SourceHealth = "OK"
    last_sample_age_sec: Optional[float] = None
    data_validity_hint: str = "VALID"
    data_quality: DataQuality = "GOOD"
    actuation_state: Optional[Literal["OFF", "ON", "LOCKED"]] = None
    anomaly_score: Optional[float] = None
    anomaly_state: Optional[str] = None
    policy_decision: Optional[str] = None


@dataclass(slots=True)
class RuntimeSnapshot:
    latest_sample: Optional[Sample]
    events: list[Event]
    status: StatusSnapshot


@dataclass(slots=True)
class Validated:
    sample: Optional[Sample]
    data_quality: DataQuality
    reasons: list[str]
    now_ts: float
