from __future__ import annotations

import csv
import json
from pathlib import Path


def replay_from_logs(samples_csv: str, events_csv: str, cfg_json: str) -> dict:
    cfg = json.loads(Path(cfg_json).read_text(encoding="utf-8"))

    limit = float(cfg.get("humidity_limit", 0.0))
    dt = max(0.001, float(cfg.get("sample_period_ms", 250)) / 1000.0)
    persistence_sec = float(cfg.get("persistence_sec", 0.0))

    samples = _load_samples(samples_csv)
    events = _load_events(events_csv)

    time_above_limit = 0.0
    for i, item in enumerate(samples):
        cur_ts = item["ts"]
        next_ts = samples[i + 1]["ts"] if i + 1 < len(samples) else (cur_ts + dt)
        if item["humidity"] >= limit:
            time_above_limit += max(0.0, next_ts - cur_ts)

    lead_times: list[float] = []
    pre_ts: float | None = None

    open_alert = False
    invalid_on_while_open = 0
    invalid_off_while_closed = 0
    transitions: list[tuple[str, float]] = []

    pre_alert_on_count = 0
    pre_alert_off_count = 0
    alert_on_count = 0
    alert_off_count = 0

    for event in events:
        kind = event["kind"]
        ts = event["ts"]

        if kind == "PRE_ALERT_ON":
            pre_alert_on_count += 1
            pre_ts = ts
        elif kind == "PRE_ALERT_OFF":
            pre_alert_off_count += 1
            state_to = str(event.get("payload", {}).get("state_to", ""))
            if state_to == "OK":
                pre_ts = None
        elif kind == "ALERT_ON":
            alert_on_count += 1
            if pre_ts is not None:
                lead_times.append(max(0.0, ts - pre_ts))
                pre_ts = None
            if open_alert:
                invalid_on_while_open += 1
            open_alert = True
            transitions.append(("ON", ts))
        elif kind == "ALERT_OFF":
            alert_off_count += 1
            if not open_alert:
                invalid_off_while_closed += 1
            open_alert = False
            transitions.append(("OFF", ts))

    lead_time_pre_to_alert = (sum(lead_times) / len(lead_times)) if lead_times else None

    flapping_count = 0
    for i in range(1, len(transitions)):
        prev_kind, prev_ts = transitions[i - 1]
        cur_kind, cur_ts = transitions[i]
        if prev_kind != cur_kind and (cur_ts - prev_ts) <= (persistence_sec * 2.0):
            flapping_count += 1

    availability_rate = 0.0
    if samples:
        span = max(0.0, samples[-1]["ts"] - samples[0]["ts"])
        expected_count = max(1, int(round(span / dt)) + 1)
        availability_rate = min(1.0, len(samples) / expected_count)

    metrics = {
        "time_above_limit": round(time_above_limit, 4),
        "lead_time_pre_to_alert": None if lead_time_pre_to_alert is None else round(lead_time_pre_to_alert, 4),
        "false_alerts": int(invalid_on_while_open + invalid_off_while_closed),
        "invalid_on_while_open": int(invalid_on_while_open),
        "invalid_off_while_closed": int(invalid_off_while_closed),
        "dangling_alert_end": int(1 if open_alert else 0),
        "flapping_count": int(flapping_count),
        "availability_rate": round(availability_rate, 4),
        "samples_count": len(samples),
        "events_count": len(events),
        "pre_alert_on_count": int(pre_alert_on_count),
        "pre_alert_off_count": int(pre_alert_off_count),
        "alert_on_count": int(alert_on_count),
        "alert_off_count": int(alert_off_count),
    }
    return metrics


def save_metrics_report(metrics: dict, output_path: str) -> None:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(metrics, indent=2, ensure_ascii=False), encoding="utf-8")


def _load_samples(path: str) -> list[dict]:
    out: list[dict] = []
    p = Path(path)
    if not p.exists():
        return out

    with p.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ts = _pick_value(row, "ts", "timestamp")
            hum = _pick_value(row, "humidity", "hum", "humidity_pct")
            if ts is None or hum is None:
                continue
            try:
                out.append({"ts": float(ts), "humidity": float(hum)})
            except (TypeError, ValueError):
                continue
    return out


def _load_events(path: str) -> list[dict]:
    out: list[dict] = []
    p = Path(path)
    if not p.exists():
        return out

    with p.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ts = _pick_value(row, "ts", "timestamp")
            kind = _pick_value(row, "kind", "type")
            if ts is None or kind is None:
                continue
            try:
                out.append({
                    "ts": float(ts),
                    "kind": str(kind),
                    "message": str(_pick_value(row, "message") or ""),
                    "payload": _parse_payload(_pick_value(row, "payload_json", "payload")),
                })
            except (TypeError, ValueError):
                continue
    return out


def _pick_value(row: dict, *keys: str):
    for key in keys:
        if key in row and row[key] not in (None, ""):
            return row[key]
    return None


def _parse_payload(value):
    if value in (None, ""):
        return {}
    if isinstance(value, dict):
        return value
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}
