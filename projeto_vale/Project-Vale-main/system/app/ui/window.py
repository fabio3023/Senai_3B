from __future__ import annotations

from collections import deque
from datetime import datetime
from pathlib import Path

from PySide6.QtCore import Qt, QTimer, QSize
from PySide6.QtGui import QIcon, QColor, QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import (
    QBoxLayout,
    QComboBox,
    QDoubleSpinBox,
    QFormLayout,
    QFrame,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListView,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QSpinBox,
    QStackedWidget,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)
import pyqtgraph as pg

from system.app.ui.pages.alerts import AlertsPage
from system.app.ui.pages.dashboard import DashboardPage
from system.app.ui.pages.settings import SettingsPage
from system.app.ui.style import fade_in


PLOT_AXIS = "#2A3340"
PLOT_TEXT = "#A7B0BB"
PLOT_GREEN = "#39C88A"
PLOT_AMBER = "#F0B81F"
PLOT_CYAN = "#2EA7CC"

ICON_DIR = Path(__file__).resolve().parent / "assets" / "icons"
NAV_ICON_COLOR = "#C8CFD8"
NAV_ICON_ACTIVE = "#F3F5F7"
NAV_ICON_SELECTED = "#18A56B"


def _page_header(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setObjectName("PageTitle")
    return lbl


def _page_subtitle(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setObjectName("CardSubtle")
    lbl.setWordWrap(True)
    return lbl


def _section_eyebrow(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setObjectName("SectionTitle")
    return lbl


def _card_shell() -> tuple[QFrame, QVBoxLayout]:
    card = QFrame()
    card.setProperty("card", "true")
    layout = QVBoxLayout(card)
    layout.setContentsMargins(14, 12, 14, 12)
    layout.setSpacing(8)
    return card, layout


def _kv_line(label: str, value: str = "—") -> tuple[QWidget, QLabel]:
    row = QWidget()
    layout = QHBoxLayout(row)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(8)

    k = QLabel(label)
    k.setObjectName("CardSubtle")
    v = QLabel(value)
    v.setObjectName("CardValueSm")
    v.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

    layout.addWidget(k)
    layout.addStretch(1)
    layout.addWidget(v)
    return row, v


def _metric_card(title: str, value: str, eyebrow: str | None = None) -> tuple[QFrame, QLabel]:
    card, layout = _card_shell()

    if eyebrow:
        e = QLabel(eyebrow)
        e.setObjectName("SectionTitle")
        layout.addWidget(e)

    t = QLabel(title)
    t.setObjectName("CardTitle")
    v = QLabel(value)
    v.setObjectName("CardValue")

    layout.addWidget(t)
    layout.addWidget(v)
    layout.addStretch(1)
    return card, v


def _tinted_svg_pixmap(path: str, color: str, size: int | QSize) -> QPixmap:
    if isinstance(size, int):
        size = QSize(size, size)

    pixmap = QPixmap(size)
    pixmap.fill(Qt.GlobalColor.transparent)

    renderer = QSvgRenderer(path)
    if not renderer.isValid():
        return pixmap

    painter = QPainter(pixmap)
    renderer.render(painter)
    painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_SourceIn)
    painter.fillRect(pixmap.rect(), QColor(color))
    painter.end()
    return pixmap


def _sidebar_icon(icon_name: str, size: int = 18) -> QIcon:
    path = str(ICON_DIR / icon_name)
    icon = QIcon()
    icon.addPixmap(_tinted_svg_pixmap(path, NAV_ICON_COLOR, size), QIcon.Mode.Normal, QIcon.State.Off)
    icon.addPixmap(_tinted_svg_pixmap(path, NAV_ICON_ACTIVE, size), QIcon.Mode.Active, QIcon.State.Off)
    icon.addPixmap(_tinted_svg_pixmap(path, NAV_ICON_SELECTED, size), QIcon.Mode.Selected, QIcon.State.Off)
    icon.addPixmap(_tinted_svg_pixmap(path, NAV_ICON_SELECTED, size), QIcon.Mode.Selected, QIcon.State.On)
    icon.addPixmap(_tinted_svg_pixmap(path, NAV_ICON_COLOR, size), QIcon.Mode.Normal, QIcon.State.On)
    return icon


# ── Sensors page ─────────────────────────────────────────────────────────────

class SensorsPage(QWidget):
    def __init__(self, max_points: int = 900):
        super().__init__()
        self.ts_h: deque[float] = deque(maxlen=max_points)
        self.h: deque[float] = deque(maxlen=max_points)
        self.ts_l: deque[float] = deque(maxlen=max_points)
        self.level: deque[float] = deque(maxlen=max_points)

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        root.addWidget(_page_header("Sensores"))
        root.addWidget(_page_subtitle("Monitoramento detalhado de umidade, nível e distância com histórico operacional."))

        overview = QGridLayout()
        overview.setHorizontalSpacing(12)
        overview.setVerticalSpacing(12)

        hum_card, self.humidity_value = _metric_card("Umidade atual", "-- %", "UMIDADE")
        lvl_card, self.level_value = _metric_card("Nível atual", "-- %", "NÍVEL")
        dist_card, self.distance_value = _metric_card("Distância ultrassônica", "-- mm", "DISTÂNCIA")
        qual_card, self.level_quality = _metric_card("Qualidade", "--", "VALIDAÇÃO")

        overview.addWidget(hum_card, 0, 0)
        overview.addWidget(lvl_card, 0, 1)
        overview.addWidget(dist_card, 0, 2)
        overview.addWidget(qual_card, 0, 3)

        for i in range(4):
            overview.setColumnStretch(i, 1)

        root.addLayout(overview)

        tabs_shell, tabs_shell_layout = _card_shell()
        self.sensor_tabs = QTabWidget()
        tabs_shell_layout.addWidget(self.sensor_tabs)
        root.addWidget(tabs_shell, stretch=1)

        hum_scroll = QScrollArea()
        hum_scroll.setWidgetResizable(True)
        hum_scroll.setFrameShape(QFrame.Shape.NoFrame)

        hum_container = QWidget()
        hum_scroll.setWidget(hum_container)

        hum_layout = QVBoxLayout(hum_container)
        hum_layout.setContentsMargins(2, 4, 6, 6)
        hum_layout.setSpacing(12)

        top_strip = QGridLayout()
        top_strip.setHorizontalSpacing(12)
        top_strip.setVerticalSpacing(12)

        hum_now_card, self.humidity_now_value = _metric_card("Umidade instantânea", "-- %")
        hum_quality_card, self.humidity_quality = _metric_card("Qualidade", "--")
        hum_flow_card, self.sensor_info = _metric_card("Estado de fluxo", "--")

        top_strip.addWidget(hum_now_card, 0, 0)
        top_strip.addWidget(hum_quality_card, 0, 1)
        top_strip.addWidget(hum_flow_card, 0, 2)

        for i in range(3):
            top_strip.setColumnStretch(i, 1)

        hum_layout.addLayout(top_strip)

        plot_card, plot_layout = _card_shell()
        plot_layout.addWidget(_section_eyebrow("Histórico de umidade"))

        self.humidity_plot = pg.PlotWidget()
        self.humidity_plot.setMinimumHeight(320)
        self.humidity_plot.showGrid(x=True, y=True, alpha=0.14)
        self.humidity_plot.hideButtons()
        self.humidity_plot.setMenuEnabled(False)
        self.humidity_plot.setMouseEnabled(x=False, y=False)
        self.humidity_plot.getAxis("left").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.humidity_plot.getAxis("bottom").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.humidity_plot.getAxis("left").setTextPen(pg.mkPen(PLOT_TEXT))
        self.humidity_plot.getAxis("bottom").setTextPen(pg.mkPen(PLOT_TEXT))
        self.humidity_plot.getPlotItem().vb.setBackgroundColor((0, 0, 0, 0))
        self.humidity_curve = self.humidity_plot.plot([], [], pen=pg.mkPen(PLOT_GREEN, width=2.8))
        plot_layout.addWidget(self.humidity_plot)

        hum_layout.addWidget(plot_card)
        hum_layout.addStretch(1)
        self.sensor_tabs.addTab(hum_scroll, "Umidade")

        lvl_scroll = QScrollArea()
        lvl_scroll.setWidgetResizable(True)
        lvl_scroll.setFrameShape(QFrame.Shape.NoFrame)

        lvl_container = QWidget()
        lvl_scroll.setWidget(lvl_container)

        lvl_layout = QVBoxLayout(lvl_container)
        lvl_layout.setContentsMargins(2, 4, 6, 6)
        lvl_layout.setSpacing(12)

        lvl_cards = QGridLayout()
        lvl_cards.setHorizontalSpacing(12)
        lvl_cards.setVerticalSpacing(12)

        lvl_now_card, self.level_now_value = _metric_card("Nível atual", "-- %")
        dist_now_card, self.distance_now_value = _metric_card("Distância", "-- mm")
        lvl_quality_card, self.level_quality_secondary = _metric_card("Qualidade", "--")
        flow_card, self.sensor_info_secondary = _metric_card("Estado de fluxo", "--")

        lvl_cards.addWidget(lvl_now_card, 0, 0)
        lvl_cards.addWidget(dist_now_card, 0, 1)
        lvl_cards.addWidget(lvl_quality_card, 0, 2)
        lvl_cards.addWidget(flow_card, 0, 3)

        for i in range(4):
            lvl_cards.setColumnStretch(i, 1)

        lvl_layout.addLayout(lvl_cards)

        level_plot_card, level_plot_layout = _card_shell()
        level_plot_layout.addWidget(_section_eyebrow("Histórico de nível"))

        self.level_plot = pg.PlotWidget()
        self.level_plot.setMinimumHeight(320)
        self.level_plot.showGrid(x=True, y=True, alpha=0.14)
        self.level_plot.hideButtons()
        self.level_plot.setMenuEnabled(False)
        self.level_plot.setMouseEnabled(x=False, y=False)
        self.level_plot.getAxis("left").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.level_plot.getAxis("bottom").setPen(pg.mkPen(PLOT_AXIS, width=1))
        self.level_plot.getAxis("left").setTextPen(pg.mkPen(PLOT_TEXT))
        self.level_plot.getAxis("bottom").setTextPen(pg.mkPen(PLOT_TEXT))
        self.level_plot.getPlotItem().vb.setBackgroundColor((0, 0, 0, 0))
        self.level_curve = self.level_plot.plot([], [], pen=pg.mkPen(PLOT_AMBER, width=2.8))
        level_plot_layout.addWidget(self.level_plot)

        lvl_layout.addWidget(level_plot_card)
        lvl_layout.addStretch(1)
        self.sensor_tabs.addTab(lvl_scroll, "Ultrassônico / Nível")

    def render(self, snap) -> None:
        st = snap.status
        humidity = (
            st.latest_humidity
            if st.latest_humidity is not None
            else (snap.latest_sample.humidity if snap.latest_sample else None)
        )
        level = getattr(st, "latest_level_pct", None)
        distance = getattr(st, "latest_distance_mm", None)
        flow_state = str(getattr(st, "flow_state", "NORMAL"))
        quality = f"{st.data_quality} / {getattr(st, 'data_validity_hint', 'VALID')}"

        hum_text = f"{humidity:.2f} %" if humidity is not None else "-- %"
        lvl_text = f"{level:.2f} %" if level is not None else "-- %"
        dist_text = f"{distance:.1f} mm" if distance is not None else "-- mm"

        self.humidity_value.setText(hum_text)
        self.level_value.setText(lvl_text)
        self.distance_value.setText(dist_text)
        self.level_quality.setText(quality)

        self.humidity_now_value.setText(hum_text)
        self.humidity_quality.setText(quality)
        self.sensor_info.setText(flow_state)

        self.level_now_value.setText(lvl_text)
        self.distance_now_value.setText(dist_text)
        self.level_quality_secondary.setText(quality)
        self.sensor_info_secondary.setText(flow_state)

        if snap.latest_sample is None:
            return

        ts = float(snap.latest_sample.ts)
        self.ts_h.append(ts)
        self.h.append(float(snap.latest_sample.humidity))
        level_sample = level if level is not None else getattr(snap.latest_sample, "level_pct", None)
        self.ts_l.append(ts)
        self.level.append(float(level_sample) if level_sample is not None else float("nan"))

        self.humidity_curve.setData(list(self.ts_h), list(self.h))
        self.level_curve.setData(list(self.ts_l), list(self.level))
        self.humidity_plot.setXRange(ts - 120.0, ts, padding=0.01)
        self.level_plot.setXRange(ts - 120.0, ts, padding=0.01)


# ── Connection / Data source page ────────────────────────────────────────────

class DataSourcePage(QWidget):
    def __init__(
        self,
        on_refresh_ports,
        on_connect,
        on_disconnect,
        on_reconnect,
        on_apply_profile,
        on_test_device=None,
    ):
        super().__init__()
        self.on_refresh_ports = on_refresh_ports
        self.on_connect = on_connect
        self.on_disconnect = on_disconnect
        self.on_reconnect = on_reconnect
        self.on_apply_profile = on_apply_profile
        self.on_test_device = on_test_device

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        root.addWidget(_page_header("Conexão"))
        root.addWidget(_page_subtitle("Integração serial com estado de conexão, payload bruto, interpretação e perfil mínimo."))

        strip = QGridLayout()
        strip.setHorizontalSpacing(12)
        strip.setVerticalSpacing(12)

        source_card, self.source_health_label = _metric_card("Fonte / Status", "—", "LINK")
        last_card, self.last_sample_label = _metric_card("Última leitura válida", "—", "AMOSTRA")
        proto_card, self.protocol_overview_value = _metric_card("Protocolo ativo", "UNKNOWN", "PROTOCOLO")
        fail_card, self.parse_overview_value = _metric_card("Falhas de parse", "0", "DIAGNÓSTICO")

        strip.addWidget(source_card, 0, 0)
        strip.addWidget(last_card, 0, 1)
        strip.addWidget(proto_card, 0, 2)
        strip.addWidget(fail_card, 0, 3)

        for i in range(4):
            strip.setColumnStretch(i, 1)

        root.addLayout(strip)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        container = QWidget()
        scroll.setWidget(container)

        inner = QVBoxLayout(container)
        inner.setContentsMargins(0, 2, 6, 6)
        inner.setSpacing(12)

        content_row = QHBoxLayout()
        content_row.setSpacing(12)

        left_col = QVBoxLayout()
        left_col.setSpacing(12)

        right_col = QVBoxLayout()
        right_col.setSpacing(12)

        conn_group = QGroupBox("Conexão")
        conn_layout = QFormLayout(conn_group)
        conn_layout.setSpacing(8)
        conn_layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)

        self.port_combo = QComboBox()
        self.baudrate_spin = QSpinBox()
        self.baudrate_spin.setRange(1200, 2_000_000)
        self.timeout_spin = QDoubleSpinBox()
        self.timeout_spin.setRange(0.05, 30.0)
        self.timeout_spin.setDecimals(2)

        self.connection_state_label = QLabel("—")
        self.connection_error_label = QLabel("—")
        self.connection_error_label.setWordWrap(True)
        self.connection_feedback_label = QLabel("—")
        self.connection_feedback_label.setWordWrap(True)

        self.refresh_btn = QPushButton("Atualizar portas")
        self.refresh_btn.setProperty("primary", "true")

        self.connect_btn = QPushButton("Conectar")
        self.connect_btn.setProperty("success", "true")

        self.disconnect_btn = QPushButton("Desconectar")
        self.disconnect_btn.setProperty("danger", "true")

        self.reconnect_btn = QPushButton("Reconectar")
        self.reconnect_btn.setProperty("primary", "true")

        self.test_device_btn = QPushButton("Testar dispositivo")
        self.test_device_btn.setProperty("primary", "true")
        self.test_device_btn.setToolTip(
            "Envia handshake VALE_HELLO e verifica se o dispositivo é compatível VALE_SENSOR_V1"
        )

        self.refresh_btn.clicked.connect(self._refresh_ports)
        self.connect_btn.clicked.connect(self._connect)
        self.disconnect_btn.clicked.connect(self._disconnect)
        self.reconnect_btn.clicked.connect(self._reconnect)
        self.test_device_btn.clicked.connect(self._test_device)

        conn_layout.addRow("Porta serial", self.port_combo)
        conn_layout.addRow("Baudrate", self.baudrate_spin)
        conn_layout.addRow("Timeout (s)", self.timeout_spin)
        conn_layout.addRow("Estado conexão", self.connection_state_label)
        conn_layout.addRow("Erro conexão", self.connection_error_label)
        conn_layout.addRow("Feedback", self.connection_feedback_label)
        conn_layout.addRow(
            "Ações",
            self._row_buttons(
                self.refresh_btn,
                self.connect_btn,
                self.disconnect_btn,
                self.reconnect_btn,
                self.test_device_btn,
            ),
        )

        left_col.addWidget(conn_group)

        profile_group = QGroupBox("Perfil mínimo")
        profile_layout = QFormLayout(profile_group)
        profile_layout.setSpacing(8)
        profile_layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)

        self.humidity_field = QComboBox()
        self.humidity_field.setEditable(True)
        self.distance_field = QComboBox()
        self.distance_field.setEditable(True)
        self.temp_field = QComboBox()
        self.temp_field.setEditable(True)

        for combo, defaults in (
            (self.humidity_field, ["humidity", "hum", "h"]),
            (self.distance_field, ["distance_mm", "distance", "dist"]),
            (self.temp_field, ["temp", "temperature", "t"]),
        ):
            combo.addItems(defaults)

        self.csv_order_field = QLineEdit()
        self.csv_order_field.setToolTip("Ordem dos campos no CSV, ex: humidity,distance_mm,temp")
        self.distance_unit = QComboBox()
        self.distance_unit.addItems(["mm", "cm", "m", "in"])
        self.distance_scale = QDoubleSpinBox()
        self.distance_scale.setRange(0.0001, 1000.0)
        self.distance_scale.setDecimals(4)
        self.distance_offset = QDoubleSpinBox()
        self.distance_offset.setRange(-5000.0, 5000.0)
        self.distance_offset.setDecimals(2)

        self.apply_profile_btn = QPushButton("Aplicar perfil")
        self.apply_profile_btn.setProperty("primary", "true")
        self.apply_profile_btn.clicked.connect(self._apply_profile)

        profile_layout.addRow("Campo umidade", self.humidity_field)
        profile_layout.addRow("Campo distância", self.distance_field)
        profile_layout.addRow("Campo temperatura", self.temp_field)
        profile_layout.addRow("Ordem CSV", self.csv_order_field)
        profile_layout.addRow("Unidade", self.distance_unit)
        profile_layout.addRow("Escala", self.distance_scale)
        profile_layout.addRow("Offset (mm)", self.distance_offset)
        profile_layout.addRow("Ação", self.apply_profile_btn)

        left_col.addWidget(profile_group)
        left_col.addStretch(1)

        raw_group = QGroupBox("Entrada bruta")
        raw_layout = QFormLayout(raw_group)
        raw_layout.setSpacing(8)
        raw_layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)

        self.last_raw_line_label = QLabel("—")
        self.last_raw_line_label.setWordWrap(True)
        self.last_raw_ts_label = QLabel("—")
        self.line_count_label = QLabel("0")
        self.parse_fail_count_label = QLabel("0")
        self.parse_fail_streak_label = QLabel("0")
        self.last_read_state_label = QLabel("—")

        raw_layout.addRow("Última linha bruta", self.last_raw_line_label)
        raw_layout.addRow("Timestamp linha", self.last_raw_ts_label)
        raw_layout.addRow("Linhas recebidas", self.line_count_label)
        raw_layout.addRow("Falhas de parse", self.parse_fail_count_label)
        raw_layout.addRow("Streak falhas parse", self.parse_fail_streak_label)
        raw_layout.addRow("Estado da leitura", self.last_read_state_label)

        right_col.addWidget(raw_group)

        interp_group = QGroupBox("Interpretação")
        interp_layout = QFormLayout(interp_group)
        interp_layout.setSpacing(8)
        interp_layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)

        self.last_good_payload_label = QLabel("—")
        self.last_good_payload_label.setWordWrap(True)
        self.current_flags_label = QLabel("—")
        self.current_flags_label.setWordWrap(True)
        self.last_parse_error_label = QLabel("—")
        self.last_failure_cause_label = QLabel("—")
        self.probable_cause_label = QLabel("—")
        self.protocol_label = QLabel("UNKNOWN")
        self.handshake_label = QLabel("—")
        self.handshake_label.setWordWrap(True)

        interp_layout.addRow("Último payload normalizado", self.last_good_payload_label)
        interp_layout.addRow("Campos reconhecidos", self.current_flags_label)
        interp_layout.addRow("Último erro de parse", self.last_parse_error_label)
        interp_layout.addRow("Causa última falha", self.last_failure_cause_label)
        interp_layout.addRow("Causa provável", self.probable_cause_label)
        interp_layout.addRow("Protocolo ativo", self.protocol_label)
        interp_layout.addRow("Handshake", self.handshake_label)

        right_col.addWidget(interp_group)
        right_col.addStretch(1)

        content_row.addLayout(left_col, 1)
        content_row.addLayout(right_col, 1)

        inner.addLayout(content_row)
        root.addWidget(scroll, stretch=1)

    @staticmethod
    def _row_buttons(*buttons: QPushButton) -> QWidget:
        row = QWidget()
        layout = QHBoxLayout(row)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)
        for btn in buttons:
            layout.addWidget(btn)
        layout.addStretch(1)
        return row

    def load_from_cfg(self, cfg) -> None:
        self.baudrate_spin.setValue(int(getattr(cfg, "baudrate", 115200)))
        self.timeout_spin.setValue(float(getattr(cfg, "serial_timeout_sec", 0.5)))
        self._set_port_value(str(getattr(cfg, "serial_port", "")))
        self.humidity_field.setCurrentText(str(getattr(cfg, "humidity_field_name", "humidity")))
        self.distance_field.setCurrentText(str(getattr(cfg, "distance_field_name", "distance_mm")))
        self.temp_field.setCurrentText(str(getattr(cfg, "temp_field_name", "temp")))
        self.csv_order_field.setText(str(getattr(cfg, "serial_csv_order", "humidity,distance_mm,temp")))
        self.distance_unit.setCurrentText(str(getattr(cfg, "distance_unit", "mm")))
        self.distance_scale.setValue(float(getattr(cfg, "distance_scale", 1.0)))
        self.distance_offset.setValue(float(getattr(cfg, "distance_offset_mm", 0.0)))

    def _set_port_value(self, port: str) -> None:
        if not port:
            return
        if self.port_combo.findText(port) < 0:
            self.port_combo.addItem(port)
        self.port_combo.setCurrentText(port)

    def _refresh_ports(self) -> None:
        ports = self.on_refresh_ports() if callable(self.on_refresh_ports) else []
        selected = self.port_combo.currentText().strip()
        self.port_combo.clear()
        if ports:
            self.port_combo.addItems(ports)
            if selected and self.port_combo.findText(selected) >= 0:
                self.port_combo.setCurrentText(selected)
        else:
            self.port_combo.addItem("<nenhuma porta encontrada>")

    def _connection_patch(self) -> dict:
        port = self.port_combo.currentText().strip()
        if port == "<nenhuma porta encontrada>":
            port = ""
        return {
            "serial_port": port,
            "baudrate": int(self.baudrate_spin.value()),
            "serial_timeout_sec": float(self.timeout_spin.value()),
        }

    def _connect(self) -> None:
        if callable(self.on_connect):
            self.on_connect(self._connection_patch())

    def _disconnect(self) -> None:
        if callable(self.on_disconnect):
            self.on_disconnect()

    def _reconnect(self) -> None:
        if callable(self.on_reconnect):
            self.on_reconnect(self._connection_patch())

    def _test_device(self) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        if not callable(self.on_test_device):
            self.connection_feedback_label.setText(f"[{ts}] Teste indisponível.")
            return

        result = self.on_test_device()
        if not isinstance(result, dict):
            self.connection_feedback_label.setText(f"[{ts}] Teste de dispositivo falhou.")
            return

        if result.get("success"):
            device = result.get("device", "?")
            proto = result.get("protocol", "?")
            fields = result.get("fields", [])
            rate = result.get("rate_hz")
            rate_txt = f" @{rate}Hz" if rate else ""
            self.connection_feedback_label.setText(
                f"[{ts}] Dispositivo compatível: {device} | {proto} | campos={fields}{rate_txt}"
            )
        else:
            err = result.get("error", "unknown")
            raw = result.get("raw_response", "")
            msg = f"[{ts}] Handshake sem resposta compatível: {err}"
            if raw:
                msg += f" (resposta: {raw[:80]})"
            self.connection_feedback_label.setText(msg)

    def _apply_profile(self) -> None:
        patch = {
            "humidity_field_name": self.humidity_field.currentText().strip() or "humidity",
            "distance_field_name": self.distance_field.currentText().strip() or "distance_mm",
            "temp_field_name": self.temp_field.currentText().strip() or "temp",
            "serial_csv_order": self.csv_order_field.text().strip() or "humidity,distance_mm,temp",
            "distance_unit": self.distance_unit.currentText().strip().lower(),
            "distance_scale": float(self.distance_scale.value()),
            "distance_offset_mm": float(self.distance_offset.value()),
        }
        if callable(self.on_apply_profile):
            self.on_apply_profile(patch)

    def render(self, snap, diagnostics: dict) -> None:
        st = snap.status
        src_age = getattr(st, "last_sample_age_sec", None)
        age_txt = f" — {src_age:.1f}s atrás" if src_age is not None else ""
        src_status = getattr(st, "source_status", "OK")
        src_type = getattr(st, "source_type", "?")

        self.source_health_label.setText(f"{src_type} | {src_status}{age_txt}")
        if snap.latest_sample is not None:
            ts_txt = datetime.fromtimestamp(float(snap.latest_sample.ts)).strftime("%H:%M:%S")
            self.last_sample_label.setText(ts_txt)
        else:
            self.last_sample_label.setText("—")

        self.protocol_overview_value.setText(str(diagnostics.get("protocol_mode", "UNKNOWN")))
        self.parse_overview_value.setText(str(diagnostics.get("parse_fail_count", 0)))

        self.connection_state_label.setText(str(diagnostics.get("connection_state", "—")))
        self.connection_error_label.setText(str(diagnostics.get("connection_error", "") or "—"))

        self.last_raw_line_label.setText(str(diagnostics.get("last_raw_line", "") or "—"))
        self.last_raw_ts_label.setText(str(diagnostics.get("last_raw_ts_iso", "") or "—"))
        self.line_count_label.setText(str(diagnostics.get("line_count", 0)))
        self.parse_fail_count_label.setText(str(diagnostics.get("parse_fail_count", 0)))
        self.parse_fail_streak_label.setText(str(diagnostics.get("parse_fail_streak", 0)))
        self.last_read_state_label.setText(str(diagnostics.get("last_read_state", "") or "—"))

        self.last_parse_error_label.setText(str(diagnostics.get("last_parse_error", "") or "—"))
        self.last_failure_cause_label.setText(str(diagnostics.get("last_failure_cause", "") or "—"))

        probable = str(diagnostics.get("probable_cause", "—"))
        self.probable_cause_label.setText({
            "nao_conectado": "Não conectado",
            "porta_nao_encontrada": "Porta não encontrada",
            "pyserial_nao_instalado": "pyserial não instalado",
            "sem_linha_chegando": "Sem linha chegando (timeout)",
            "parse_falhando": "Parse falhando — verificar formato do payload",
            "perfil_incompativel": "Perfil incompatível — muitos erros consecutivos",
            "sensor_possivelmente_travado": "Sensor possivelmente travado/repetindo",
            "leitura_normalizada_ok": "Leitura normalizada OK",
            "dispositivo_vale_v1_detectado": "Dispositivo compatível VALE_SENSOR_V1 detectado",
            "causa_indefinida": "Causa indefinida",
        }.get(probable, probable))

        self.protocol_label.setText(str(diagnostics.get("protocol_mode", "UNKNOWN")))

        hs_info = diagnostics.get("handshake_info")
        hs_attempted = diagnostics.get("handshake_attempted", False)
        if not hs_attempted:
            self.handshake_label.setText("Não tentado")
        elif hs_info is None:
            self.handshake_label.setText("Sem resultado")
        elif hs_info.get("success"):
            dev = hs_info.get("device", "?")
            fields = hs_info.get("fields", [])
            rate = hs_info.get("rate_hz")
            rate_txt = f" @{rate}Hz" if rate else ""
            self.handshake_label.setText(f"OK — {dev} | campos={fields}{rate_txt}")
        else:
            err = hs_info.get("error", "")
            if err == "no_response":
                self.handshake_label.setText("Sem resposta (modo genérico disponível)")
            elif err == "not_vale_protocol":
                self.handshake_label.setText("Resposta não é VALE_SENSOR_V1 (modo genérico disponível)")
            else:
                self.handshake_label.setText(f"Falha: {err}")

        sample = snap.latest_sample
        self.current_flags_label.setText(
            " | ".join(str(f) for f in getattr(sample, "flags", []))
            if sample else "—"
        )

        last_good = diagnostics.get("last_good_sample")
        if isinstance(last_good, dict):
            hum = last_good.get("humidity")
            dist = last_good.get("distance_mm")
            temp = last_good.get("temp")
            self.last_good_payload_label.setText(
                f"humidity={hum} | distance_mm={dist} | temp={temp}"
            )
        else:
            self.last_good_payload_label.setText("—")


# ── Main window ──────────────────────────────────────────────────────────────

class MainWindow(QMainWindow):
    def __init__(self, controller, cfg):
        super().__init__()
        self.controller = controller
        self.cfg = cfg
        self._last_snapshot = None
        self._prev_page_idx = 0
        self._sidebar_mode: str | None = None

        self.setWindowTitle("Project Vale — Monitor")
        self.setWindowIcon(QIcon(str(ICON_DIR / "vale.svg")))
        self.setWindowFlags(
            Qt.Window | Qt.WindowMinMaxButtonsHint | Qt.WindowCloseButtonHint
        )
        self.setMinimumSize(860, 600)
        self.resize(1420, 860)

        self.sensors = SensorsPage()
        self.data_source = DataSourcePage(
            on_refresh_ports=self.refresh_serial_ports,
            on_connect=self.connect_serial_source,
            on_disconnect=self.disconnect_serial_source,
            on_reconnect=self.reconnect_serial_source,
            on_apply_profile=self.apply_serial_profile,
            on_test_device=self.test_serial_device,
        )
        self.alerts = AlertsPage()
        self.settings = SettingsPage(
            on_apply=self.on_apply_config,
            on_capture_reading=self.capture_current_reading,
            on_apply_and_connect=self.apply_and_connect_serial,
        )
        self.dashboard = DashboardPage(
            cfg,
            on_open_sensors=self.open_sensors_tab,
            on_open_connection=self.open_connection_tab,
            on_open_settings=self.open_settings_tab,
        )

        self.pages = QStackedWidget()
        self.pages.addWidget(self.dashboard)
        self.pages.addWidget(self.sensors)
        self.pages.addWidget(self.data_source)
        self.pages.addWidget(self.alerts)
        self.pages.addWidget(self.settings)
        self.pages.setMinimumWidth(0)
        self.pages.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        for page in (self.dashboard, self.sensors, self.data_source, self.alerts, self.settings):
            page.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)

        self.pages_scroll = QScrollArea()
        self.pages_scroll.setObjectName("PagesScroll")
        self.pages_scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.pages_scroll.setWidgetResizable(True)
        self.pages_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.pages_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.pages_scroll.setWidget(self.pages)
        self.pages_scroll.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.pages_scroll.setMinimumWidth(0)

        self.sidebar = self._build_sidebar()
        self.sidebar.currentRowChanged.connect(self._on_nav_changed)
        self.sidebar.setCurrentRow(0)

        root = QWidget(self)
        root.setObjectName("AppShell")

        self.root_layout = QVBoxLayout(root)
        self.root_layout.setContentsMargins(14, 14, 14, 14)
        self.root_layout.setSpacing(12)

        self.shell_layout = QBoxLayout(QBoxLayout.Direction.LeftToRight)
        self.shell_layout.setSpacing(12)

        self.sidebar_frame.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Expanding)
        self.shell_layout.addWidget(self.sidebar_frame)
        self.shell_layout.addWidget(self.pages_scroll, 1)

        self.root_layout.addLayout(self.shell_layout)
        self.setCentralWidget(root)

        self.settings.load_from_cfg(self.cfg)
        self.data_source.load_from_cfg(self.cfg)
        self.refresh_serial_ports()
        self.on_tick()

        self.timer = QTimer(self)
        self.update_sample_interval(int(self.cfg.sample_period_ms))
        self.timer.timeout.connect(self.on_tick)
        self.timer.start()

        self._apply_responsive_chrome(self.width())

    def _build_sidebar(self) -> QListWidget:
        self.sidebar_frame = QFrame()
        self.sidebar_frame.setObjectName("Sidebar")

        self.side_layout = QBoxLayout(QBoxLayout.Direction.TopToBottom, self.sidebar_frame)
        self.side_layout.setContentsMargins(16, 16, 16, 16)
        self.side_layout.setSpacing(12)

        self.brand_box, brand_layout = _card_shell()

        brand_row = QHBoxLayout()
        brand_row.setContentsMargins(0, 0, 0, 0)
        brand_row.setSpacing(10)

        self.brand_logo = QLabel()
        self.brand_logo.setPixmap(QIcon(str(ICON_DIR / "vale.svg")).pixmap(QSize(28, 28)))

        brand_text_col = QVBoxLayout()
        brand_text_col.setContentsMargins(0, 0, 0, 0)
        brand_text_col.setSpacing(2)

        self.brand_title = QLabel("VALE")
        self.brand_title.setObjectName("SidebarBrand")

        self.brand_subtitle = QLabel("Project Monitor")
        self.brand_subtitle.setObjectName("SidebarSubtle")

        brand_text_col.addWidget(self.brand_title)
        brand_text_col.addWidget(self.brand_subtitle)

        brand_row.addWidget(self.brand_logo)
        brand_row.addLayout(brand_text_col, 1)

        brand_layout.addLayout(brand_row)
        self.side_layout.addWidget(self.brand_box)

        self.nav_title = QLabel("Navegação")
        self.nav_title.setObjectName("SectionTitle")
        self.side_layout.addWidget(self.nav_title)

        nav = QListWidget()
        nav.setObjectName("SidebarNav")
        nav.setIconSize(QSize(18, 18))
        nav.setSpacing(4)
        nav.setUniformItemSizes(False)
        nav.setWrapping(False)
        nav.setWordWrap(False)
        nav.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        items = [
            ("pie-chart.svg", "Dashboard"),
            ("humidity-sensor.svg", "Sensores"),
            ("world-connection.svg", "Conexão"),
            ("warning.svg", "Alertas"),
            ("settings.svg", "Configurações"),
        ]
        self._nav_labels = [text for _, text in items]

        for icon_file, text in items:
            item = QListWidgetItem(_sidebar_icon(icon_file, 18), text)
            item.setToolTip(text)
            nav.addItem(item)

        self.side_layout.addWidget(nav, stretch=1)

        self.footer_box, footer_layout = _card_shell()
        footer = QLabel("Monitoramento industrial\nTempo real")
        footer.setObjectName("CardSubtle")
        footer.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignBottom)
        footer_layout.addWidget(footer)
        self.side_layout.addWidget(self.footer_box)

        return nav

    def _set_nav_labels_visible(self, visible: bool) -> None:
        for idx, text in enumerate(self._nav_labels):
            item = self.sidebar.item(idx)
            if item is None:
                continue
            item.setText(text if visible else "")
            item.setToolTip(text)

    def _apply_sidebar_full(self) -> None:
        self.shell_layout.setDirection(QBoxLayout.Direction.LeftToRight)
        self.side_layout.setDirection(QBoxLayout.Direction.TopToBottom)

        self.root_layout.setContentsMargins(14, 14, 14, 14)
        self.root_layout.setSpacing(12)

        self.sidebar_frame.setMinimumWidth(228)
        self.sidebar_frame.setMaximumWidth(248)
        self.sidebar_frame.setMinimumHeight(0)
        self.sidebar_frame.setMaximumHeight(16777215)
        self.sidebar_frame.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Expanding)

        self.brand_box.show()
        self.brand_title.show()
        self.brand_subtitle.show()
        self.nav_title.show()
        self.footer_box.show()

        self._set_nav_labels_visible(True)
        self.sidebar.setViewMode(QListView.ViewMode.ListMode)
        self.sidebar.setFlow(QListView.Flow.TopToBottom)
        self.sidebar.setMovement(QListView.Movement.Static)
        self.sidebar.setWrapping(False)
        self.sidebar.setMaximumHeight(16777215)
        self.sidebar.setMinimumHeight(0)
        self.sidebar.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Expanding)
        self.sidebar.setIconSize(QSize(18, 18))
        self.sidebar.setSpacing(4)

    def _apply_sidebar_rail(self) -> None:
        self.shell_layout.setDirection(QBoxLayout.Direction.LeftToRight)
        self.side_layout.setDirection(QBoxLayout.Direction.TopToBottom)

        self.root_layout.setContentsMargins(12, 12, 12, 12)
        self.root_layout.setSpacing(10)

        self.sidebar_frame.setMinimumWidth(84)
        self.sidebar_frame.setMaximumWidth(92)
        self.sidebar_frame.setMinimumHeight(0)
        self.sidebar_frame.setMaximumHeight(16777215)
        self.sidebar_frame.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)

        self.brand_box.show()
        self.brand_title.hide()
        self.brand_subtitle.hide()
        self.nav_title.hide()
        self.footer_box.hide()

        self._set_nav_labels_visible(False)
        self.sidebar.setViewMode(QListView.ViewMode.ListMode)
        self.sidebar.setFlow(QListView.Flow.TopToBottom)
        self.sidebar.setMovement(QListView.Movement.Static)
        self.sidebar.setWrapping(False)
        self.sidebar.setMaximumHeight(16777215)
        self.sidebar.setMinimumHeight(0)
        self.sidebar.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Expanding)
        self.sidebar.setIconSize(QSize(20, 20))
        self.sidebar.setSpacing(6)

    def _apply_sidebar_topbar(self) -> None:
        self.shell_layout.setDirection(QBoxLayout.Direction.TopToBottom)
        self.side_layout.setDirection(QBoxLayout.Direction.LeftToRight)

        self.root_layout.setContentsMargins(10, 10, 10, 10)
        self.root_layout.setSpacing(10)

        self.sidebar_frame.setMinimumWidth(0)
        self.sidebar_frame.setMaximumWidth(16777215)
        self.sidebar_frame.setMinimumHeight(88)
        self.sidebar_frame.setMaximumHeight(108)
        self.sidebar_frame.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

        self.brand_box.show()
        self.brand_title.show()
        self.brand_subtitle.hide()
        self.nav_title.hide()
        self.footer_box.hide()

        self._set_nav_labels_visible(True)
        self.sidebar.setViewMode(QListView.ViewMode.ListMode)
        self.sidebar.setFlow(QListView.Flow.LeftToRight)
        self.sidebar.setMovement(QListView.Movement.Static)
        self.sidebar.setWrapping(False)
        self.sidebar.setMinimumHeight(54)
        self.sidebar.setMaximumHeight(60)
        self.sidebar.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.sidebar.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.sidebar.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.sidebar.setIconSize(QSize(18, 18))
        self.sidebar.setSpacing(8)

    def _apply_responsive_chrome(self, width: int) -> None:
        if width >= 1500:
            mode = "full"
        elif width >= 1180:
            mode = "rail"
        else:
            mode = "topbar"

        if mode == self._sidebar_mode:
            return

        self._sidebar_mode = mode
        if mode == "full":
            self._apply_sidebar_full()
        elif mode == "rail":
            self._apply_sidebar_rail()
        else:
            self._apply_sidebar_topbar()

        self.sidebar_frame.updateGeometry()
        self.sidebar.updateGeometry()
        self.pages_scroll.updateGeometry()

    def resizeEvent(self, event) -> None:
        super().resizeEvent(event)
        self._apply_responsive_chrome(event.size().width())

    def _on_nav_changed(self, idx: int) -> None:
        if idx < 0:
            return
        self.pages.setCurrentIndex(idx)
        widget = self.pages.widget(idx)
        if widget is not None and idx != self._prev_page_idx:
            fade_in(widget, duration=200)
        self._prev_page_idx = idx

    def open_sensors_tab(self) -> None:
        self.sidebar.setCurrentRow(1)

    def open_connection_tab(self) -> None:
        self.sidebar.setCurrentRow(2)

    def open_settings_tab(self) -> None:
        self.sidebar.setCurrentRow(4)

    def update_sample_interval(self, sample_period_ms: int) -> None:
        self.timer.setInterval(max(10, int(sample_period_ms)))

    def refresh_serial_ports(self) -> list[str]:
        if not hasattr(self.controller, "serial_list_ports"):
            return []
        ports = self.controller.serial_list_ports()
        if ports:
            self.data_source.port_combo.clear()
            self.data_source.port_combo.addItems(ports)
        return ports

    def connect_serial_source(self, patch: dict | None = None) -> None:
        if patch:
            self.on_apply_config(patch)
        ts = datetime.now().strftime("%H:%M:%S")
        if hasattr(self.controller, "serial_connect"):
            ok = bool(self.controller.serial_connect())
            msg = "Solicitação de conexão enviada." if ok else "Falha ao conectar (ver estado/erro)."
            self.data_source.connection_feedback_label.setText(f"[{ts}] {msg}")
        self._refresh_connection_view()

    def disconnect_serial_source(self) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        if hasattr(self.controller, "serial_disconnect"):
            ok = bool(self.controller.serial_disconnect())
            msg = "Fonte desconectada." if ok else "Nenhuma conexão ativa para desconectar."
            self.data_source.connection_feedback_label.setText(f"[{ts}] {msg}")
        self._refresh_connection_view()

    def reconnect_serial_source(self, patch: dict | None = None) -> None:
        if patch:
            self.on_apply_config(patch)
        ts = datetime.now().strftime("%H:%M:%S")
        if hasattr(self.controller, "serial_reconnect"):
            ok = bool(self.controller.serial_reconnect())
            msg = "Reconexão solicitada." if ok else "Falha ao reconectar (ver estado/erro)."
            self.data_source.connection_feedback_label.setText(f"[{ts}] {msg}")
        self._refresh_connection_view()

    def apply_serial_profile(self, patch: dict) -> None:
        self.on_apply_config(patch)

    def test_serial_device(self) -> dict:
        if hasattr(self.controller, "serial_test_device"):
            return self.controller.serial_test_device()
        return {"success": False, "error": "not_available"}

    def apply_and_connect_serial(self, patch: dict) -> str:
        patch["source_type"] = "SERIAL"
        self.on_apply_config(patch)
        if str(self.cfg.source_type) == "SERIAL":
            if hasattr(self.controller, "rebuild_from_config"):
                self.controller.rebuild_from_config(self.cfg)
            ok = bool(self.controller.serial_connect()) if hasattr(self.controller, "serial_connect") else False
            self._refresh_connection_view()
            if ok:
                return "Config aplicada, source SERIAL reconstruída, conexão estabelecida."
            diag = self.controller.get_source_diagnostics() if hasattr(self.controller, "get_source_diagnostics") else {}
            err = diag.get("connection_error", "erro desconhecido")
            return f"Config aplicada, mas conexão falhou: {err}"
        return "Config aplicada, mas source_type não é SERIAL."

    def on_tick(self) -> None:
        snap = self.controller.tick()
        self._last_snapshot = snap
        diagnostics = self.controller.get_source_diagnostics() if hasattr(self.controller, "get_source_diagnostics") else {}
        self.dashboard.render(snap)
        self.sensors.render(snap)
        self.data_source.render(snap, diagnostics)
        self.alerts.render(snap)
        self.settings.render_operational(snap)

    def _refresh_connection_view(self) -> None:
        if self._last_snapshot is None:
            return
        diagnostics = self.controller.get_source_diagnostics() if hasattr(self.controller, "get_source_diagnostics") else {}
        self.data_source.render(self._last_snapshot, diagnostics)

    def capture_current_reading(self) -> dict | None:
        snap = self._last_snapshot
        if snap is None:
            return None
        st = snap.status
        sample = snap.latest_sample
        return {
            "distance_mm": getattr(st, "latest_distance_mm", None),
            "level_pct": getattr(st, "latest_level_pct", None),
            "source_status": getattr(st, "source_status", "OK"),
            "data_validity_hint": getattr(st, "data_validity_hint", "VALID"),
            "flags": list(getattr(sample, "flags", []) or []),
        }

    def on_apply_config(self, patch: dict) -> dict:
        old_period = int(self.cfg.sample_period_ms)
        old_source_type = str(self.cfg.source_type)

        config_events = self.controller.update_config(patch)
        if config_events is None:
            config_events = []
        elif hasattr(config_events, "kind"):
            config_events = [config_events]
        elif not isinstance(config_events, list):
            config_events = []

        self.cfg = self.controller.get_config()
        new_period = int(self.cfg.sample_period_ms)
        sample_period_changed = new_period != old_period
        if sample_period_changed:
            self.update_sample_interval(new_period)

        source_changed = str(self.cfg.source_type) != old_source_type
        source_rebuilt = False
        if source_changed and hasattr(self.controller, "rebuild_from_config"):
            rebuild_events = self.controller.rebuild_from_config(self.cfg)
            if isinstance(rebuild_events, list):
                config_events.extend(rebuild_events)
            source_rebuilt = True

        self.settings.load_from_cfg(self.cfg)
        self.data_source.load_from_cfg(self.cfg)

        snap = self.controller.tick()
        self._last_snapshot = snap
        merged = list(snap.events)
        seen = {
            (float(getattr(e, "ts", 0.0)), str(getattr(e, "kind", "")), str(getattr(e, "message", "")))
            for e in merged
        }
        for ev in config_events:
            key = (
                float(getattr(ev, "ts", 0.0)),
                str(getattr(ev, "kind", "")),
                str(getattr(ev, "message", "")),
            )
            if key not in seen:
                seen.add(key)
                merged.append(ev)
        snap.events = merged

        diagnostics = self.controller.get_source_diagnostics() if hasattr(self.controller, "get_source_diagnostics") else {}
        self.dashboard.render(snap)
        self.sensors.render(snap)
        self.data_source.render(snap, diagnostics)
        self.alerts.render(snap)
        self.settings.render_operational(snap)

        return {
            "sample_period_changed": sample_period_changed,
            "source_changed": source_changed,
            "source_rebuilt": source_rebuilt,
            "events": config_events,
        }
