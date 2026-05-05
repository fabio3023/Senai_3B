from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
import time

from system.core.models import Config, Sample


def ensure_data_dir(path: str = "data") -> Path:
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _as_float(value, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _as_int(value, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return int(default)


def _as_bool(value, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes", "on")
    if isinstance(value, (int, float)):
        return bool(value)
    return bool(default)


def _coerce_config(d: dict) -> Config:
    cfg = Config()
    if not isinstance(d, dict):
        return cfg

    float_fields = {
        "humidity_limit",
        "pre_margin_pct",
        "persistence_sec",
        "hysteresis_pct",
        "min_event_interval_sec",
        "distance_empty_mm",
        "distance_full_mm",
        "level_stall_epsilon_mm",
        "attention_stall_sec",
        "anomaly_stall_sec",
        "choke_stall_sec",
        "max_on_sec",
        "min_off_sec",
        "cooldown_sec",
        "anomaly_threshold",
        "serial_timeout_sec",
        "distance_scale",
        "distance_offset_mm",
        "distance_clamp_min_mm",
        "distance_clamp_max_mm",
        "humidity_min_valid",
        "humidity_max_valid",
        "distance_min_valid",
        "distance_max_valid",
    }
    int_fields = {"sample_period_ms", "baudrate"}
    bool_fields = {"replay_loop", "actuation_enabled", "anomaly_enabled", "distance_clamp_enabled"}

    for k, v in d.items():
        if not hasattr(cfg, k):
            continue
        if k in float_fields:
            setattr(cfg, k, _as_float(v, getattr(cfg, k)))
        elif k in int_fields:
            setattr(cfg, k, _as_int(v, getattr(cfg, k)))
        elif k in bool_fields:
            setattr(cfg, k, _as_bool(v, getattr(cfg, k)))
        else:
            setattr(cfg, k, v)

    cfg.sample_period_ms = max(10, int(cfg.sample_period_ms))
    cfg.distance_empty_mm = max(1.0, float(cfg.distance_empty_mm))
    cfg.distance_full_mm = max(0.0, float(cfg.distance_full_mm))
    if cfg.distance_empty_mm <= cfg.distance_full_mm:
        cfg.distance_empty_mm = cfg.distance_full_mm + 1.0

    cfg.level_stall_epsilon_mm = max(0.05, float(cfg.level_stall_epsilon_mm))
    cfg.attention_stall_sec = max(1.0, float(cfg.attention_stall_sec))
    cfg.anomaly_stall_sec = max(cfg.attention_stall_sec, float(cfg.anomaly_stall_sec))
    cfg.choke_stall_sec = max(cfg.anomaly_stall_sec, float(cfg.choke_stall_sec))
    cfg.serial_timeout_sec = max(0.05, float(cfg.serial_timeout_sec))
    cfg.replay_path = str(cfg.replay_path or "")
    cfg.humidity_field_name = str(cfg.humidity_field_name or "humidity")
    cfg.distance_field_name = str(cfg.distance_field_name or "distance_mm")
    cfg.temp_field_name = str(cfg.temp_field_name or "temp")
    cfg.distance_unit = str(cfg.distance_unit or "mm").lower()
    if cfg.distance_unit not in ("mm", "cm", "m", "in"):
        cfg.distance_unit = "mm"
    cfg.distance_scale = max(0.0001, float(cfg.distance_scale))
    cfg.distance_clamp_min_mm = float(cfg.distance_clamp_min_mm)
    cfg.distance_clamp_max_mm = float(cfg.distance_clamp_max_mm)
    if cfg.distance_clamp_max_mm < cfg.distance_clamp_min_mm:
        cfg.distance_clamp_max_mm = cfg.distance_clamp_min_mm
    cfg.humidity_min_valid = float(cfg.humidity_min_valid)
    cfg.humidity_max_valid = float(cfg.humidity_max_valid)
    if cfg.humidity_max_valid <= cfg.humidity_min_valid:
        cfg.humidity_max_valid = cfg.humidity_min_valid + 1.0
    cfg.distance_min_valid = float(cfg.distance_min_valid)
    cfg.distance_max_valid = float(cfg.distance_max_valid)
    if cfg.distance_max_valid <= cfg.distance_min_valid:
        cfg.distance_max_valid = cfg.distance_min_valid + 1.0
    cfg.serial_csv_order = str(cfg.serial_csv_order or "humidity,distance_mm,temp")
    cfg.serial_protocol_mode = str(cfg.serial_protocol_mode or "AUTO").upper()
    if cfg.serial_protocol_mode not in ("AUTO", "GENERIC_JSON", "GENERIC_CSV", "VALE_SENSOR_V1"):
        cfg.serial_protocol_mode = "AUTO"
    cfg.anomaly_threshold = float(cfg.anomaly_threshold)
    if cfg.anomaly_threshold < 0.0:
        cfg.anomaly_threshold = 0.0
    if cfg.anomaly_threshold > 1.0:
        cfg.anomaly_threshold = 1.0
    cfg.max_on_sec = max(0.01, float(cfg.max_on_sec))
    cfg.min_off_sec = max(0.0, float(cfg.min_off_sec))
    cfg.cooldown_sec = max(0.0, float(cfg.cooldown_sec))
    cfg.actuation_mode = str(cfg.actuation_mode or "MANUAL").upper()
    if cfg.actuation_mode not in ("MANUAL", "AUTO"):
        cfg.actuation_mode = "MANUAL"

    if str(cfg.source_type) not in ("SIM", "SERIAL", "REPLAY"):
        cfg.source_type = "SIM"

    return cfg


def load_config(path: str = "data/config.json") -> Config:
    p = Path(path)
    ensure_data_dir(str(p.parent))

    if not p.exists():
        cfg = Config()
        save_config(cfg, path)
        return cfg

    data = json.loads(p.read_text(encoding="utf-8"))
    cfg = _coerce_config(data)
    return cfg


def save_config(cfg: Config, path: str = "data/config.json") -> None:
    p = Path(path)
    ensure_data_dir(str(p.parent))
    safe_cfg = _coerce_config(asdict(cfg))
    p.write_text(json.dumps(asdict(safe_cfg), indent=2, ensure_ascii=False), encoding="utf-8")


def _to_float_or_none(value) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _distance_to_mm(value: float | None, cfg: Config) -> float | None:
    if value is None:
        return None
    unit_factor = {"mm": 1.0, "cm": 10.0, "m": 1000.0, "in": 25.4}.get(str(cfg.distance_unit).lower(), 1.0)
    out = (float(value) * unit_factor * float(cfg.distance_scale)) + float(cfg.distance_offset_mm)
    if bool(getattr(cfg, "distance_clamp_enabled", False)):
        out = min(float(cfg.distance_clamp_max_mm), max(float(cfg.distance_clamp_min_mm), out))
    return out


def _pick_value(payload: dict, preferred_key: str, fallback_keys: list[str]) -> tuple[object, str]:
    for key in [preferred_key, *fallback_keys]:
        if key in payload:
            return payload.get(key), str(key)
    return None, ""


def _distance_to_level_pct(distance_mm: float | None, cfg: Config) -> tuple[float | None, str | None]:
    if distance_mm is None:
        return None, None
    empty_mm = float(getattr(cfg, "distance_empty_mm", 1000.0))
    full_mm = float(getattr(cfg, "distance_full_mm", 200.0))
    span = empty_mm - full_mm
    if span <= 0.0:
        return None, "CALIB_INVALID_EMPTY_FULL"
    level_pct = ((empty_mm - float(distance_mm)) / span) * 100.0
    if level_pct < 0.0:
        return 0.0, "LEVEL_CLAMP_LOW"
    if level_pct > 100.0:
        return 100.0, "LEVEL_CLAMP_HIGH"
    return level_pct, None


def normalize_payload_to_sample(payload: dict, cfg: Config, source_id: str) -> Sample:
    if not isinstance(payload, dict):
        payload = {}

    hum_key = str(getattr(cfg, "humidity_field_name", "humidity"))
    dist_key = str(getattr(cfg, "distance_field_name", "distance_mm"))
    temp_key = str(getattr(cfg, "temp_field_name", "temp"))
    humidity_raw, humidity_used_key = _pick_value(payload, hum_key, ["humidity", "hum", "h"])
    distance_raw, distance_used_key = _pick_value(payload, dist_key, ["distance_mm", "distance", "dist", "ultra_mm"])
    temp_raw, _ = _pick_value(payload, temp_key, ["temp", "temperature", "t"])
    level_raw, level_used_key = _pick_value(payload, "level_pct", ["level", "levelPercent"])
    weight_raw = payload.get("weight")

    flags_val = payload.get("flags", [])
    if isinstance(flags_val, str):
        flags = [f for f in flags_val.split("|") if f]
    elif isinstance(flags_val, list):
        flags = [str(x) for x in flags_val]
    else:
        flags = []

    humidity = _to_float_or_none(humidity_raw)
    if humidity is None:
        humidity = 0.0
        flags.append("HUMIDITY_MISSING_DEFAULTED")
    humidity = float(humidity)
    if humidity_used_key:
        flags.append(f"NORM_H_KEY:{humidity_used_key}")

    distance_in = _to_float_or_none(distance_raw)
    distance_mm = _distance_to_mm(distance_in, cfg)
    if distance_used_key:
        flags.append(f"NORM_D_KEY:{distance_used_key}")
    if distance_in is not None:
        flags.append(f"NORM_D_UNIT:{str(cfg.distance_unit).lower()}")
        flags.append(f"NORM_D_SCALE:{float(cfg.distance_scale):.6g}")
        flags.append(f"NORM_D_OFFSET_MM:{float(cfg.distance_offset_mm):.6g}")
    if bool(getattr(cfg, "distance_clamp_enabled", False)) and distance_in is not None and distance_mm is not None:
        unit_factor = {"mm": 1.0, "cm": 10.0, "m": 1000.0, "in": 25.4}.get(str(cfg.distance_unit).lower(), 1.0)
        unclamped = (float(distance_in) * unit_factor * float(cfg.distance_scale)) + float(cfg.distance_offset_mm)
        if abs(unclamped - distance_mm) > 1e-9:
            flags.append("DISTANCE_CLAMP_APPLIED")

    level_direct = _to_float_or_none(level_raw)
    level_pct = level_direct
    if level_direct is None and distance_mm is not None:
        level_pct, level_reason = _distance_to_level_pct(distance_mm, cfg)
        flags.append("LEVEL_DERIVED_FROM_DISTANCE")
        if level_reason:
            flags.append(level_reason)
    elif level_used_key:
        flags.append(f"NORM_L_KEY:{level_used_key}")

    return Sample(
        ts=time.time(),
        humidity=humidity,
        temp=_to_float_or_none(temp_raw),
        distance_mm=distance_mm,
        level_pct=level_pct,
        weight=_to_float_or_none(weight_raw),
        source_id=source_id,
        flags=flags,
    )
