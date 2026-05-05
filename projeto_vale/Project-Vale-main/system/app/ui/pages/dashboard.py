from __future__ import annotations

from collections import deque
from datetime import datetime
import time

import pyqtgraph as pg
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QVBoxLayout,
    QWidget,
)

from system.app.ui.style import set_severity


PLOT_AXIS = "#2A3340"
PLOT_TEXT = "#A7B0BB"
PLOT_GREEN = "#39C88A"
PLOT_AMBER = "#F0B81F"


class DashboardPage(QWidget):
    def __init__(
        self,
        cfg,
        max_points: int = 240,
        on_open_sensors=None,
        on_open_connection=None,
        on_open_settings=None,
    ):
        super().__init__()
        self.cfg = cfg
        self.on_open_sensors = on_open_sensors
        self.on_open_connection = on_open_connection
        self.on_open_settings = on_open_settings

        self.recent_events: deque[str] = deque(maxlen=8)
        self.ts: deque[float] = deque(maxlen=max_points)
        self.humidity_series: deque[float] = deque(maxlen=max_points)
        self.distance_series: deque[float] = deque(maxlen=max_points)

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        # ── Header ───────────────────────────────────────────
        header_row = QHBoxLayout()
        header_row.setSpacing(12)

        title_col = QVBoxLayout()
        title_col.setSpacing(2)

        title = QLabel("Dashboard")
        title.setObjectName("PageTitle")

        subtitle = QLabel("Monitoramento operacional em tempo real.")
        subtitle.setObjectName("CardSubtle")

        title_col.addWidget(title)
        title_col.addWidget(subtitle)

        header_row.addLayout(title_col, stretch=1)
        root.addLayout(header_row)

        # ── Faixa de status mais seca ────────────────────────
        self.status_panel = QFrame()
        self.status_panel.setProperty("panel", "true")
        status_layout = QHBoxLayout(self.status_panel)
        status_layout.setContentsMargins(16, 12, 16, 12)
        status_layout.setSpacing(12)

        status_text_col = QVBoxLayout()
        status_text_col.setSpacing(2)

        self.status_label = QLabel("Sistema")
        self.status_label.setObjectName("SectionEyebrow")

        self.status_meta = QLabel("Fonte — • Qualidade — • Fluxo —")
        self.status_meta.setObjectName("CardSubtle")

        status_text_col.addWidget(self.status_label)
        status_text_col.addWidget(self.status_meta)

        self.badge = QLabel("STATUS")
        self.badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.badge.setMinimumHeight(50)
        self.badge.setMinimumWidth(176)
        self.badge.setObjectName("BadgeLabel")
        self.badge.setStyleSheet(
            "font-size: 14pt; font-weight: 900; letter-spacing: 0.5px; padding: 6px 14px;"
        )
        set_severity(self.badge, "FAIL")

        self.pre_banner_label = QLabel("PRÉ-ALERTA")
        self.pre_banner_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.pre_banner_label.setMinimumHeight(40)
        self.pre_banner_label.setMinimumWidth(144)
        self.pre_banner_label.setObjectName("BadgeLabel")
        self.pre_banner_label.setStyleSheet(
            "font-size: 10.5pt; font-weight: 800; letter-spacing: 0.4px; padding: 4px 12px;"
        )
        set_severity(self.pre_banner_label, "WARN")
        self.pre_banner_label.setVisible(False)

        status_layout.addLayout(status_text_col, stretch=1)
        status_layout.addWidget(self.badge, 0, Qt.AlignmentFlag.AlignVCenter)
        status_layout.addWidget(self.pre_banner_label, 0, Qt.AlignmentFlag.AlignVCenter)

        root.addWidget(self.status_panel)

        # ── Métricas topo ────────────────────────────────────
        metrics = QGridLayout()
        metrics.setHorizontalSpacing(12)
        metrics.setVerticalSpacing(12)

        self.metric_humidity, self.humidity_value = self._metric_card(
            label="UMIDADE",
            value="-- %",
            accent_start="#18A56B",
            accent_end="#D8A61C",
        )
        self.metric_distance, self.distance_value = self._metric_card(
            label="DISTÂNCIA",
            value="-- mm",
            accent_start="#18A56B",
            accent_end="#D8A61C",
        )
        self.metric_flow, self.flow_top_value = self._metric_card(
            label="FLUXO",
            value="--",
            accent_start="#18A56B",
            accent_end="#D8A61C",
        )
        self.metric_rate, self.rate_top_value = self._metric_card(
            label="PACOTES / SEGUNDO",
            value="-- Hz",
            accent_start="#18A56B",
            accent_end="#D8A61C",
        )

        metrics.addWidget(self.metric_humidity, 0, 0)
        metrics.addWidget(self.metric_distance, 0, 1)
        metrics.addWidget(self.metric_flow, 0, 2)
        metrics.addWidget(self.metric_rate, 0, 3)

        for i in range(4):
            metrics.setColumnStretch(i, 1)

        root.addLayout(metrics)

        # ── Miolo ────────────────────────────────────────────
        middle = QHBoxLayout()
        middle.setSpacing(12)

        # Esquerda
        left_col = QVBoxLayout()
        left_col.setSpacing(12)

        self.chart_panel, self.chart_body = self._panel("Gráfico de Leituras")
        self.chart_panel.setMaximumHeight(360)
        self.plot = pg.PlotWidget()
        self.plot.setMinimumHeight(160)
        self.plot.setMaximumHeight(220)
        self.plot.showGrid(x=True, y=True, alpha=0.14)
        self.plot.hideButtons()
        self.plot.setMenuEnabled(False)
        self.plot.setMouseEnabled(x=False, y=False)
        self.plot.getAxis("left").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.plot.getAxis("bottom").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.plot.getAxis("left").setTextPen(pg.mkPen(PLOT_TEXT))
        self.plot.getAxis("bottom").setTextPen(pg.mkPen(PLOT_TEXT))
        self.plot.getPlotItem().vb.setBackgroundColor((0, 0, 0, 0))

        self.humidity_curve = self.plot.plot([], [], pen=pg.mkPen(PLOT_GREEN, width=2.8))
        self.distance_curve = self.plot.plot([], [], pen=pg.mkPen(PLOT_AMBER, width=2.5))

        self.chart_body.addWidget(self.plot)

        legend_row = QHBoxLayout()
        legend_row.setSpacing(18)
        legend_row.addWidget(self._legend_chip("Umidade", PLOT_GREEN))
        legend_row.addWidget(self._legend_chip("Distância", PLOT_AMBER))
        legend_row.addStretch(1)
        self.chart_body.addLayout(legend_row)

        left_col.addWidget(self.chart_panel)

        self.log_panel, self.log_body = self._panel("Log de Eventos")
        self.log_panel.setMaximumHeight(160)
        self.log_rows: list[QWidget] = []
        for _ in range(2):
            row = self._event_row("—", "Sem eventos recentes")
            self.log_rows.append(row)
            self.log_body.addWidget(row)

        left_col.addWidget(self.log_panel)
        middle.addLayout(left_col, stretch=7)

        # Direita
        right_col = QVBoxLayout()
        right_col.setSpacing(12)

        self.connection_panel, self.connection_body = self._panel("Status da Conexão")
        self.conn_status = self._big_status("Desconectado", "FAIL")
        self.connection_body.addWidget(self.conn_status)

        conn_runtime_row, self.conn_runtime_value = self._kv("Runtime", "—")
        conn_source_row, self.conn_source_value = self._kv("Fonte", "—")
        conn_flow_row, self.conn_flow_value = self._kv("Fluxo", "—")
        conn_age_row, self.conn_age_value = self._kv("Última leitura", "—")

        self.connection_body.addWidget(conn_runtime_row)
        self.connection_body.addWidget(conn_source_row)
        self.connection_body.addWidget(conn_flow_row)
        self.connection_body.addWidget(conn_age_row)

        right_col.addWidget(self.connection_panel)

        self.reading_panel, self.reading_body = self._panel("Última Leitura")
        read_h_row, self.read_humidity_value = self._kv("Umidade", "-- %")
        read_d_row, self.read_distance_value = self._kv("Distância", "-- mm")
        read_f_row, self.read_flow_value = self._kv("Fluxo", "--")
        self.read_quality_badge = self._big_status("—", "FAIL")

        self.reading_body.addWidget(read_h_row)
        self.reading_body.addWidget(read_d_row)
        self.reading_body.addWidget(read_f_row)
        self.reading_body.addWidget(self.read_quality_badge)

        right_col.addWidget(self.reading_panel)
        right_col.addStretch(1)

        middle.addLayout(right_col, stretch=3)
        root.addLayout(middle, stretch=1)

    def _panel(self, title: str) -> tuple[QFrame, QVBoxLayout]:
        panel = QFrame()
        panel.setProperty("panel", "true")

        outer = QVBoxLayout(panel)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        header = QFrame()
        header.setProperty("flatpanel", "true")

        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(14, 10, 14, 10)
        header_layout.setSpacing(8)

        lbl = QLabel(title)
        lbl.setObjectName("PanelTitle")

        header_layout.addWidget(lbl)
        header_layout.addStretch(1)

        body = QVBoxLayout()
        body.setContentsMargins(14, 14, 14, 14)
        body.setSpacing(10)

        outer.addWidget(header)
        outer.addLayout(body)
        return panel, body

    def _metric_card(
        self,
        label: str,
        value: str,
        accent_start: str,
        accent_end: str,
    ) -> tuple[QFrame, QLabel]:
        card = QFrame()
        card.setProperty("metric", "true")

        outer = QVBoxLayout(card)
        outer.setContentsMargins(14, 12, 14, 10)
        outer.setSpacing(6)

        label_lbl = QLabel(label)
        label_lbl.setObjectName("SectionEyebrow")

        value_lbl = QLabel(value)
        value_lbl.setObjectName("CardValue")

        accent = QFrame()
        accent.setFixedHeight(5)
        accent.setStyleSheet(
            f"background: qlineargradient(x1:0, y1:0, x2:1, y2:0, "
            f"stop:0 {accent_start}, stop:0.82 {accent_start}, stop:0.83 {accent_end}, stop:1 {accent_end});"
            "border:none; border-radius:2px;"
        )

        outer.addWidget(label_lbl)
        outer.addWidget(value_lbl)
        outer.addStretch(1)
        outer.addWidget(accent)

        return card, value_lbl

    def _legend_chip(self, text: str, color: str) -> QWidget:
        w = QWidget()
        lay = QHBoxLayout(w)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(6)

        dot = QFrame()
        dot.setFixedSize(12, 12)
        dot.setStyleSheet(f"background:{color}; border:none; border-radius:2px;")

        lbl = QLabel(text)
        lbl.setObjectName("CardSubtle")

        lay.addWidget(dot)
        lay.addWidget(lbl)
        return w

    def _kv(self, label: str, value: str) -> tuple[QWidget, QLabel]:
        row = QWidget()
        lay = QHBoxLayout(row)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(8)

        key = QLabel(label)
        key.setObjectName("CardSubtle")

        val = QLabel(value)
        val.setObjectName("CardValueSm")
        val.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        lay.addWidget(key)
        lay.addStretch(1)
        lay.addWidget(val)
        return row, val

    def _big_status(self, text: str, severity: str) -> QLabel:
        lbl = QLabel(text)
        lbl.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        lbl.setMinimumHeight(40)
        lbl.setObjectName("BadgeLabel")
        set_severity(lbl, severity)
        return lbl

    def _event_row(self, ts_text: str, message: str) -> QWidget:
        row = QWidget()
        lay = QHBoxLayout(row)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(10)

        bullet = QLabel("■")
        bullet.setStyleSheet("color:#A6E22E; font-size: 10pt;")
        bullet.setAlignment(Qt.AlignmentFlag.AlignTop)

        ts_lbl = QLabel(ts_text)
        ts_lbl.setObjectName("CardSubtle")
        ts_lbl.setMinimumWidth(72)
        ts_lbl.setAlignment(Qt.AlignmentFlag.AlignTop)

        msg_lbl = QLabel(message)
        msg_lbl.setObjectName("CardValueSm")
        msg_lbl.setWordWrap(True)
        msg_lbl.setAlignment(Qt.AlignmentFlag.AlignTop)

        lay.addWidget(bullet)
        lay.addWidget(ts_lbl)
        lay.addWidget(msg_lbl, 1)

        row._bullet = bullet
        row._ts = ts_lbl
        row._msg = msg_lbl
        return row

    def _set_event_row(self, row: QWidget, ts_text: str, kind: str, message: str) -> None:
        row._ts.setText(ts_text)
        row._msg.setText(message)

        color = "#A6E22E"
        if kind in {"WARN"}:
            color = "#F0B81F"
        elif kind in {"ALERT", "FAIL"}:
            color = "#D65A56"

        row._bullet.setStyleSheet(f"color:{color}; font-size: 10pt;")

    def render(self, snap) -> None:
        st = snap.status
        level = str(st.level)
        state = str(st.state)

        humidity = (
            st.latest_humidity
            if st.latest_humidity is not None
            else (snap.latest_sample.humidity if snap.latest_sample else None)
        )
        latest_distance = getattr(st, "latest_distance_mm", None)
        flow_state = str(getattr(st, "flow_state", "NORMAL"))

        src_type = str(getattr(st, "source_type", "SIM"))
        src_health = str(getattr(st, "source_status", "OK"))
        src_age = getattr(st, "last_sample_age_sec", None)

        quality = str(getattr(st, "data_quality", "MISSING"))
        quality_sev = "OK" if quality == "GOOD" else ("WARN" if quality == "NOISY" else "ALERT")

        set_severity(self.badge, level)
        self.badge.setText(level)
        self.pre_banner_label.setVisible(state == "PRE_ALERT")
        self.status_meta.setText(
            f"Fonte {src_type} • Qualidade {quality} • Fluxo {flow_state}"
        )

        rate_value = getattr(st, "sample_rate_hz", None)
        if rate_value is None:
            if src_age is None or src_age <= 0:
                rate_value = 0.0
            else:
                rate_value = max(0.0, min(99.0, 1.0 / max(src_age, 0.001)))

        self.humidity_value.setText(f"{humidity:.1f} %" if humidity is not None else "-- %")
        self.distance_value.setText(f"{latest_distance:.0f} mm" if latest_distance is not None else "-- mm")
        self.flow_top_value.setText(flow_state)
        self.rate_top_value.setText(f"{float(rate_value):.1f} Hz")

        conn_text = "Conectado" if src_health in {"OK", "CONNECTED"} else src_health
        conn_sev = "OK" if src_health in {"OK", "CONNECTED"} else ("WARN" if src_health in {"DEGRADED", "ATTENTION"} else "ALERT")
        set_severity(self.conn_status, conn_sev)
        self.conn_status.setText(conn_text)

        self.conn_runtime_value.setText(state)
        self.conn_source_value.setText(src_type)
        self.conn_flow_value.setText(flow_state)
        self.conn_age_value.setText(f"{src_age:.1f}s atrás" if src_age is not None else "—")

        self.read_humidity_value.setText(f"{humidity:.1f} %" if humidity is not None else "-- %")
        self.read_distance_value.setText(f"{latest_distance:.0f} mm" if latest_distance is not None else "-- mm")
        self.read_flow_value.setText(flow_state)

        set_severity(self.read_quality_badge, quality_sev)
        self.read_quality_badge.setText(quality)

        events = getattr(snap, "events", [])
        if events:
            for event in events[-4:]:
                ev_ts = float(getattr(event, "ts", time.time()))
                ev_kind = str(getattr(event, "kind", "INFO"))
                ev_msg = str(getattr(event, "message", ""))
                packed = f"{datetime.fromtimestamp(ev_ts).strftime('%H:%M:%S')}|{ev_kind}|{ev_msg}"
                self.recent_events.append(packed)

        recent = list(self.recent_events)[-2:]
        while len(recent) < 2:
            recent.insert(0, "—|INFO|Sem eventos recentes")

        for row, packed in zip(self.log_rows, recent):
            ts_txt, kind, msg = packed.split("|", 2)
            self._set_event_row(row, ts_txt, kind, msg)

        if snap.latest_sample is None:
            return

        ts = float(snap.latest_sample.ts)
        self.ts.append(ts)
        self.humidity_series.append(float(humidity) if humidity is not None else float("nan"))
        self.distance_series.append(float(latest_distance) if latest_distance is not None else float("nan"))

        self.humidity_curve.setData(list(self.ts), list(self.humidity_series))
        self.distance_curve.setData(list(self.ts), list(self.distance_series))
        self.plot.setXRange(ts - 120.0, ts, padding=0.01)
