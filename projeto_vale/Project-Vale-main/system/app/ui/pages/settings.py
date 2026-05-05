from __future__ import annotations

from datetime import datetime

from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDoubleSpinBox,
    QFormLayout,
    QFrame,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QSpinBox,
    QVBoxLayout,
    QWidget,
)

from system.core.models import Config


class SettingsPage(QWidget):
    def __init__(self, on_apply, on_capture_reading=None, on_apply_and_connect=None):
        super().__init__()
        self.on_apply = on_apply
        self.on_capture_reading = on_capture_reading
        self.on_apply_and_connect = on_apply_and_connect

        self._effective_phase2 = {
            "anomaly_enabled": False,
            "anomaly_threshold": 0.8,
            "actuation_enabled": False,
            "actuation_mode": "MANUAL",
            "max_on_sec": 30.0,
            "min_off_sec": 10.0,
            "cooldown_sec": 5.0,
        }

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        title = QLabel("Configurações")
        title.setObjectName("PageTitle")

        subtitle = QLabel("Parâmetros operacionais da Fase 1, integração de dados, calibração e governança da Fase 2.")
        subtitle.setObjectName("CardSubtle")
        subtitle.setWordWrap(True)

        root.addWidget(title)
        root.addWidget(subtitle)

        # ── faixa superior ───────────────────────────────────
        summary_grid = QGridLayout()
        summary_grid.setHorizontalSpacing(12)
        summary_grid.setVerticalSpacing(12)

        source_card, self.source_summary_value = self._metric_card("ORIGEM", "Fonte ativa", "—")
        phase1_card, self.phase1_summary_value = self._metric_card("MONITORAMENTO", "Fase 1", "—")
        phase2_card, self.phase2_status_value = self._metric_card("FASE 2", "Estado efetivo", "—")
        calib_card, self.calibration_summary_value = self._metric_card("CALIBRAÇÃO", "Vazio / cheio", "—")

        summary_grid.addWidget(source_card, 0, 0)
        summary_grid.addWidget(phase1_card, 0, 1)
        summary_grid.addWidget(phase2_card, 0, 2)
        summary_grid.addWidget(calib_card, 0, 3)

        for i in range(4):
            summary_grid.setColumnStretch(i, 1)

        root.addLayout(summary_grid)

        # ── widgets/config ───────────────────────────────────
        self.humidity_limit = QDoubleSpinBox()
        self.humidity_limit.setRange(0.0, 100.0)
        self.humidity_limit.setDecimals(2)

        self.pre_margin_pct = QDoubleSpinBox()
        self.pre_margin_pct.setRange(0.0, 50.0)
        self.pre_margin_pct.setDecimals(2)

        self.persistence_sec = QDoubleSpinBox()
        self.persistence_sec.setRange(0.0, 120.0)
        self.persistence_sec.setDecimals(2)

        self.hysteresis_pct = QDoubleSpinBox()
        self.hysteresis_pct.setRange(0.0, 50.0)
        self.hysteresis_pct.setDecimals(2)

        self.min_event_interval_sec = QDoubleSpinBox()
        self.min_event_interval_sec.setRange(0.0, 120.0)
        self.min_event_interval_sec.setDecimals(2)

        self.sample_period_ms = QSpinBox()
        self.sample_period_ms.setRange(10, 10_000)

        self.source_type = QComboBox()
        self.source_type.addItems(["SIM", "SERIAL", "REPLAY"])
        self.source_type.currentTextChanged.connect(lambda _v: self._update_context_enabled_states())

        self.serial_port = QLineEdit()

        self.baudrate = QSpinBox()
        self.baudrate.setRange(1200, 2_000_000)

        self.serial_timeout_sec = QDoubleSpinBox()
        self.serial_timeout_sec.setRange(0.05, 30.0)
        self.serial_timeout_sec.setDecimals(2)

        self.replay_path = QLineEdit()
        self.replay_loop = QCheckBox("loop replay")

        self.anomaly_enabled = QCheckBox("Ativar detecção")
        self.anomaly_enabled.toggled.connect(lambda _v: self._update_context_enabled_states())

        self.anomaly_threshold = QDoubleSpinBox()
        self.anomaly_threshold.setRange(0.0, 1.0)
        self.anomaly_threshold.setDecimals(3)
        self.anomaly_threshold.setSingleStep(0.01)

        self.actuation_enabled = QCheckBox("Permitir atuação")
        self.actuation_enabled.toggled.connect(lambda _v: self._update_context_enabled_states())

        self.actuation_mode = QComboBox()
        self.actuation_mode.addItems(["MANUAL", "AUTO"])

        self.max_on_sec = QDoubleSpinBox()
        self.max_on_sec.setRange(0.01, 3600.0)
        self.max_on_sec.setDecimals(2)

        self.min_off_sec = QDoubleSpinBox()
        self.min_off_sec.setRange(0.0, 3600.0)
        self.min_off_sec.setDecimals(2)

        self.cooldown_sec = QDoubleSpinBox()
        self.cooldown_sec.setRange(0.0, 3600.0)
        self.cooldown_sec.setDecimals(2)

        self.distance_empty_mm = QDoubleSpinBox()
        self.distance_empty_mm.setRange(1.0, 5000.0)
        self.distance_empty_mm.setDecimals(1)

        self.distance_full_mm = QDoubleSpinBox()
        self.distance_full_mm.setRange(0.0, 5000.0)
        self.distance_full_mm.setDecimals(1)

        self.level_stall_epsilon_mm = QDoubleSpinBox()
        self.level_stall_epsilon_mm.setRange(0.05, 100.0)
        self.level_stall_epsilon_mm.setDecimals(2)

        self.attention_stall_sec = QDoubleSpinBox()
        self.attention_stall_sec.setRange(1.0, 600.0)
        self.attention_stall_sec.setDecimals(1)

        self.anomaly_stall_sec = QDoubleSpinBox()
        self.anomaly_stall_sec.setRange(1.0, 600.0)
        self.anomaly_stall_sec.setDecimals(1)

        self.choke_stall_sec = QDoubleSpinBox()
        self.choke_stall_sec.setRange(1.0, 600.0)
        self.choke_stall_sec.setDecimals(1)

        self.humidity_field_name = QLineEdit()
        self.distance_field_name = QLineEdit()
        self.temp_field_name = QLineEdit()

        self.serial_csv_order = QLineEdit()
        self.serial_csv_order.setToolTip("Ordem dos campos no CSV serial, ex: humidity,distance_mm,temp")

        self.serial_protocol_mode = QComboBox()
        self.serial_protocol_mode.addItems(["AUTO", "GENERIC_JSON", "GENERIC_CSV", "VALE_SENSOR_V1"])
        self.serial_protocol_mode.setToolTip(
            "AUTO: tenta handshake, depois genérico. GENERIC_JSON/CSV: força formato. "
            "VALE_SENSOR_V1: exige handshake."
        )

        self.distance_unit = QComboBox()
        self.distance_unit.addItems(["mm", "cm", "m", "in"])

        self.distance_scale = QDoubleSpinBox()
        self.distance_scale.setRange(0.0001, 1000.0)
        self.distance_scale.setDecimals(4)

        self.distance_offset_mm = QDoubleSpinBox()
        self.distance_offset_mm.setRange(-5000.0, 5000.0)
        self.distance_offset_mm.setDecimals(2)

        self.humidity_min_valid = QDoubleSpinBox()
        self.humidity_min_valid.setRange(-100.0, 200.0)
        self.humidity_min_valid.setDecimals(2)

        self.humidity_max_valid = QDoubleSpinBox()
        self.humidity_max_valid.setRange(-100.0, 200.0)
        self.humidity_max_valid.setDecimals(2)

        self.distance_min_valid = QDoubleSpinBox()
        self.distance_min_valid.setRange(-5000.0, 100000.0)
        self.distance_min_valid.setDecimals(1)

        self.distance_max_valid = QDoubleSpinBox()
        self.distance_max_valid.setRange(-5000.0, 100000.0)
        self.distance_max_valid.setDecimals(1)

        self.distance_empty_mm.setToolTip("Usado para calibrar o nível quando o reservatório está vazio.")
        self.distance_full_mm.setToolTip("Usado para calibrar o nível quando o reservatório está cheio.")
        self.distance_scale.setToolTip("Multiplica a leitura bruta antes de converter para nível.")
        self.distance_offset_mm.setToolTip("Correção fixa em mm aplicada após escala.")
        self.distance_min_valid.setToolTip("Leituras fora desta faixa serão tratadas como ruidosas/inválidas.")
        self.distance_max_valid.setToolTip("Leituras fora desta faixa serão tratadas como ruidosas/inválidas.")
        self.humidity_min_valid.setToolTip("Faixa mínima aceitável de umidade.")
        self.humidity_max_valid.setToolTip("Faixa máxima aceitável de umidade.")
        self.anomaly_enabled.setToolTip("Quando desativado, o detector de anomalia não interfere na decisão operacional.")
        self.anomaly_threshold.setToolTip("Limiar de sensibilidade para marcar ATTENTION/ANOMALY no runtime da Fase 2.")
        self.actuation_enabled.setToolTip("Permite que o runtime envie comando real ao atuador quando a política autorizar.")
        self.actuation_mode.setToolTip("AUTO permite execução automática; MANUAL mantém decisão sem acionar automaticamente.")
        self.max_on_sec.setToolTip("Limite de segurança para tempo contínuo ligado do atuador.")
        self.min_off_sec.setToolTip("Tempo mínimo desligado entre ciclos para reduzir desgaste/oscilações.")
        self.cooldown_sec.setToolTip("Janela de cooldown aplicada após safety stop antes de nova tentativa.")

        # ── textos dinâmicos ─────────────────────────────────
        self.summary_label = QLabel("")
        self.summary_label.setObjectName("CardSubtle")
        self.summary_label.setWordWrap(True)

        self.phase2_summary_label = QLabel("Fase 2: aguardando configuração.")
        self.phase2_summary_label.setObjectName("CardSubtle")
        self.phase2_summary_label.setWordWrap(True)

        self.calibration_runtime_label = QLabel("Leitura operacional: aguardando dados.")
        self.calibration_runtime_label.setObjectName("CardSubtle")
        self.calibration_runtime_label.setWordWrap(True)

        self.operational_state_label = QLabel("Aceite operacional: sem avaliação.")
        self.operational_state_label.setObjectName("CardSubtle")
        self.operational_state_label.setWordWrap(True)

        self.config_hint = QLabel(
            "Ajustes avançados usam os mesmos parâmetros das seções anteriores. "
            "O foco aqui é manter rastreabilidade operacional, não virar cockpit de nave espacial."
        )
        self.config_hint.setObjectName("CardSubtle")
        self.config_hint.setWordWrap(True)

        # ── scroll principal ─────────────────────────────────
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        root.addWidget(scroll, stretch=1)

        container = QWidget()
        scroll.setWidget(container)

        content = QVBoxLayout(container)
        content.setContentsMargins(0, 0, 0, 0)
        content.setSpacing(12)

        # Runtime / captura
        runtime_card = QFrame()
        runtime_card.setProperty("card", "true")
        runtime_layout = QVBoxLayout(runtime_card)
        runtime_layout.setContentsMargins(14, 12, 14, 12)
        runtime_layout.setSpacing(10)

        runtime_title = QLabel("Leitura operacional e captura")
        runtime_title.setObjectName("SectionTitle")
        runtime_layout.addWidget(runtime_title)
        runtime_layout.addWidget(self.calibration_runtime_label)
        runtime_layout.addWidget(self.operational_state_label)

        capture_row = QHBoxLayout()
        capture_row.setSpacing(8)

        self.capture_empty_btn = QPushButton("Marcar leitura atual como vazio")
        self.capture_empty_btn.setProperty("primary", "true")
        self.capture_empty_btn.clicked.connect(self._capture_empty_from_live)

        self.capture_full_btn = QPushButton("Marcar leitura atual como cheio")
        self.capture_full_btn.setProperty("primary", "true")
        self.capture_full_btn.clicked.connect(self._capture_full_from_live)

        capture_row.addWidget(self.capture_empty_btn)
        capture_row.addWidget(self.capture_full_btn)
        capture_row.addStretch(1)
        runtime_layout.addLayout(capture_row)

        content.addWidget(runtime_card)

        # grade principal
        grid = QGridLayout()
        grid.setHorizontalSpacing(12)
        grid.setVerticalSpacing(12)

        sec_general = self._make_section("Geral", [
            ("Intervalo de leitura (ms)", self.sample_period_ms),
            ("Origem dos dados", self.source_type),
        ])

        sec_monitor = self._make_section("Monitoramento", [
            ("Limite de umidade (%)", self.humidity_limit),
            ("Margem de pré-alerta (%)", self.pre_margin_pct),
            ("Persistência do alerta (s)", self.persistence_sec),
            ("Histerese (%)", self.hysteresis_pct),
            ("Intervalo mínimo entre eventos (s)", self.min_event_interval_sec),
        ])

        sec_detection = self._make_section("Detecção", [
            ("Variação mínima para fluxo (mm)", self.level_stall_epsilon_mm),
            ("Tempo para atenção (s)", self.attention_stall_sec),
            ("Tempo para anomalia (s)", self.anomaly_stall_sec),
            ("Tempo para travamento (s)", self.choke_stall_sec),
        ])

        sec_source = self._make_section("Fonte de dados", [
            ("Porta serial", self.serial_port),
            ("Baudrate", self.baudrate),
            ("Tempo limite da conexão (s)", self.serial_timeout_sec),
            ("Protocolo serial", self.serial_protocol_mode),
            ("Arquivo de replay", self.replay_path),
            ("Repetir replay", self.replay_loop),
        ])

        sec_phase2 = self._make_section("Fase 2 — Governança operacional", [
            ("Detecção de anomalia", self.anomaly_enabled),
            ("Limiar de anomalia", self.anomaly_threshold),
            ("Permitir atuação", self.actuation_enabled),
            ("Modo de atuação", self.actuation_mode),
            ("Tempo máximo ligado (s)", self.max_on_sec),
            ("Tempo mínimo desligado (s)", self.min_off_sec),
            ("Cooldown após safety stop (s)", self.cooldown_sec),
        ])

        sec_profile = self._make_section("Perfil dos dados", [
            ("Campo de umidade", self.humidity_field_name),
            ("Campo de distância", self.distance_field_name),
            ("Campo de temperatura", self.temp_field_name),
            ("Ordem CSV serial", self.serial_csv_order),
            ("Unidade da distância", self.distance_unit),
        ])

        sec_calibration = self._make_section("Calibração do sensor", [
            ("Distância com reservatório vazio (mm)", self.distance_empty_mm),
            ("Distância com reservatório cheio (mm)", self.distance_full_mm),
            ("Escala da distância", self.distance_scale),
            ("Correção de distância (mm)", self.distance_offset_mm),
            ("Umidade mínima válida", self.humidity_min_valid),
            ("Umidade máxima válida", self.humidity_max_valid),
            ("Distância mínima válida (mm)", self.distance_min_valid),
            ("Distância máxima válida (mm)", self.distance_max_valid),
        ])

        sec_notes = self._make_section("Resumo técnico", [
            ("Contexto ativo", self.summary_label),
            ("Governança Fase 2", self.phase2_summary_label),
            ("Notas", self.config_hint),
        ])

        grid.addWidget(sec_general, 0, 0)
        grid.addWidget(sec_monitor, 0, 1)
        grid.addWidget(sec_detection, 1, 0)
        grid.addWidget(sec_source, 1, 1)
        grid.addWidget(sec_phase2, 2, 0)
        grid.addWidget(sec_profile, 2, 1)
        grid.addWidget(sec_calibration, 3, 0)
        grid.addWidget(sec_notes, 3, 1)

        grid.setColumnStretch(0, 1)
        grid.setColumnStretch(1, 1)

        content.addLayout(grid)
        content.addStretch(1)

        # footer
        footer = QFrame()
        footer.setProperty("card", "true")
        footer_layout = QVBoxLayout(footer)
        footer_layout.setContentsMargins(14, 12, 14, 12)
        footer_layout.setSpacing(10)

        footer_title = QLabel("Ações")
        footer_title.setObjectName("SectionTitle")
        footer_layout.addWidget(footer_title)

        footer_actions = QHBoxLayout()
        footer_actions.setSpacing(8)

        self.btn = QPushButton("Aplicar")
        self.btn.setProperty("primary", "true")
        self.btn.clicked.connect(self._apply)

        self.btn_apply_connect = QPushButton("Aplicar e conectar sensor")
        self.btn_apply_connect.setProperty("success", "true")
        self.btn_apply_connect.clicked.connect(self._apply_and_connect)

        self.restore_btn = QPushButton("Restaurar padrão seguro")
        self.restore_btn.setProperty("danger", "true")
        self.restore_btn.clicked.connect(self._restore_defaults)

        footer_actions.addWidget(self.btn)
        footer_actions.addWidget(self.btn_apply_connect)
        footer_actions.addWidget(self.restore_btn)
        footer_actions.addStretch(1)

        footer_layout.addLayout(footer_actions)

        self.feedback_label = QLabel("Pronto para aplicar alterações.")
        self.feedback_label.setObjectName("CardSubtle")
        self.feedback_label.setWordWrap(True)
        footer_layout.addWidget(self.feedback_label)

        root.addWidget(footer)

    def _metric_card(self, eyebrow: str, title: str, value: str) -> tuple[QFrame, QLabel]:
        card = QFrame()
        card.setProperty("metric", "true")

        layout = QVBoxLayout(card)
        layout.setContentsMargins(14, 12, 14, 10)
        layout.setSpacing(4)

        eyebrow_lbl = QLabel(eyebrow)
        eyebrow_lbl.setObjectName("SectionEyebrow")

        title_lbl = QLabel(title)
        title_lbl.setObjectName("PanelTitle")

        value_lbl = QLabel(value)
        value_lbl.setObjectName("CardValue")

        accent = QFrame()
        accent.setFixedHeight(5)
        accent.setStyleSheet(
            "background: qlineargradient(x1:0, y1:0, x2:1, y2:0, "
            "stop:0 #18A56B, stop:0.82 #18A56B, stop:0.83 #D8A61C, stop:1 #D8A61C);"
            "border:none; border-radius:2px;"
        )

        layout.addWidget(eyebrow_lbl)
        layout.addWidget(title_lbl)
        layout.addWidget(value_lbl)
        layout.addStretch(1)
        layout.addWidget(accent)
        return card, value_lbl

    def _make_section(self, title: str, rows: list[tuple[str, QWidget]]) -> QGroupBox:
        section = QGroupBox(title)
        layout = QFormLayout(section)
        layout.setSpacing(8)
        layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)
        for label, field in rows:
            layout.addRow(label, field)
        return section

    def load_from_cfg(self, cfg):
        self.humidity_limit.setValue(float(cfg.humidity_limit))
        self.pre_margin_pct.setValue(float(cfg.pre_margin_pct))
        self.persistence_sec.setValue(float(cfg.persistence_sec))
        self.hysteresis_pct.setValue(float(cfg.hysteresis_pct))
        self.min_event_interval_sec.setValue(float(cfg.min_event_interval_sec))
        self.sample_period_ms.setValue(int(cfg.sample_period_ms))

        self.source_type.setCurrentText(str(cfg.source_type))
        self.serial_port.setText(str(getattr(cfg, "serial_port", "COM3")))
        self.baudrate.setValue(int(getattr(cfg, "baudrate", 115200)))
        self.serial_timeout_sec.setValue(float(getattr(cfg, "serial_timeout_sec", 0.5)))
        self.replay_path.setText(str(getattr(cfg, "replay_path", "")))
        self.replay_loop.setChecked(bool(getattr(cfg, "replay_loop", True)))

        self.anomaly_enabled.setChecked(bool(getattr(cfg, "anomaly_enabled", False)))
        self.anomaly_threshold.setValue(float(getattr(cfg, "anomaly_threshold", 0.8)))
        self.actuation_enabled.setChecked(bool(getattr(cfg, "actuation_enabled", False)))
        self.actuation_mode.setCurrentText(str(getattr(cfg, "actuation_mode", "MANUAL")))
        self.max_on_sec.setValue(float(getattr(cfg, "max_on_sec", 30.0)))
        self.min_off_sec.setValue(float(getattr(cfg, "min_off_sec", 10.0)))
        self.cooldown_sec.setValue(float(getattr(cfg, "cooldown_sec", 5.0)))

        self._effective_phase2 = {
            "anomaly_enabled": bool(getattr(cfg, "anomaly_enabled", False)),
            "anomaly_threshold": float(getattr(cfg, "anomaly_threshold", 0.8)),
            "actuation_enabled": bool(getattr(cfg, "actuation_enabled", False)),
            "actuation_mode": str(getattr(cfg, "actuation_mode", "MANUAL")).upper(),
            "max_on_sec": float(getattr(cfg, "max_on_sec", 30.0)),
            "min_off_sec": float(getattr(cfg, "min_off_sec", 10.0)),
            "cooldown_sec": float(getattr(cfg, "cooldown_sec", 5.0)),
        }

        self.distance_empty_mm.setValue(float(getattr(cfg, "distance_empty_mm", 620.0)))
        self.distance_full_mm.setValue(float(getattr(cfg, "distance_full_mm", 180.0)))
        self.level_stall_epsilon_mm.setValue(float(getattr(cfg, "level_stall_epsilon_mm", 1.5)))
        self.attention_stall_sec.setValue(float(getattr(cfg, "attention_stall_sec", 6.0)))
        self.anomaly_stall_sec.setValue(float(getattr(cfg, "anomaly_stall_sec", 12.0)))
        self.choke_stall_sec.setValue(float(getattr(cfg, "choke_stall_sec", 18.0)))

        self.humidity_field_name.setText(str(getattr(cfg, "humidity_field_name", "humidity")))
        self.distance_field_name.setText(str(getattr(cfg, "distance_field_name", "distance_mm")))
        self.temp_field_name.setText(str(getattr(cfg, "temp_field_name", "temp")))
        self.serial_csv_order.setText(str(getattr(cfg, "serial_csv_order", "humidity,distance_mm,temp")))
        self.serial_protocol_mode.setCurrentText(str(getattr(cfg, "serial_protocol_mode", "AUTO")).upper())
        self.distance_unit.setCurrentText(str(getattr(cfg, "distance_unit", "mm")))
        self.distance_scale.setValue(float(getattr(cfg, "distance_scale", 1.0)))
        self.distance_offset_mm.setValue(float(getattr(cfg, "distance_offset_mm", 0.0)))
        self.humidity_min_valid.setValue(float(getattr(cfg, "humidity_min_valid", 0.0)))
        self.humidity_max_valid.setValue(float(getattr(cfg, "humidity_max_valid", 100.0)))
        self.distance_min_valid.setValue(float(getattr(cfg, "distance_min_valid", 0.0)))
        self.distance_max_valid.setValue(float(getattr(cfg, "distance_max_valid", 3000.0)))

        self._update_context_enabled_states()
        self._update_summary()

    def _coerce_events(self, raw_result) -> list:
        if raw_result is None:
            return []
        if isinstance(raw_result, list):
            return [item for item in raw_result if hasattr(item, "kind")]
        if hasattr(raw_result, "kind"):
            return [raw_result]
        if isinstance(raw_result, dict):
            events = raw_result.get("events")
            if isinstance(events, list):
                return [item for item in events if hasattr(item, "kind")]
            if hasattr(events, "kind"):
                return [events]
        return []

    def _collect_patch(self) -> dict:
        return {
            "humidity_limit": float(self.humidity_limit.value()),
            "pre_margin_pct": float(self.pre_margin_pct.value()),
            "persistence_sec": float(self.persistence_sec.value()),
            "hysteresis_pct": float(self.hysteresis_pct.value()),
            "min_event_interval_sec": float(self.min_event_interval_sec.value()),
            "sample_period_ms": int(self.sample_period_ms.value()),
            "source_type": self.source_type.currentText(),
            "serial_port": self.serial_port.text().strip(),
            "baudrate": int(self.baudrate.value()),
            "serial_timeout_sec": float(self.serial_timeout_sec.value()),
            "replay_path": self.replay_path.text().strip(),
            "replay_loop": bool(self.replay_loop.isChecked()),
            "anomaly_enabled": bool(self.anomaly_enabled.isChecked()),
            "anomaly_threshold": float(self.anomaly_threshold.value()),
            "actuation_enabled": bool(self.actuation_enabled.isChecked()),
            "actuation_mode": self.actuation_mode.currentText().strip().upper(),
            "max_on_sec": float(self.max_on_sec.value()),
            "min_off_sec": float(self.min_off_sec.value()),
            "cooldown_sec": float(self.cooldown_sec.value()),
            "distance_empty_mm": float(self.distance_empty_mm.value()),
            "distance_full_mm": float(self.distance_full_mm.value()),
            "level_stall_epsilon_mm": float(self.level_stall_epsilon_mm.value()),
            "attention_stall_sec": float(self.attention_stall_sec.value()),
            "anomaly_stall_sec": float(self.anomaly_stall_sec.value()),
            "choke_stall_sec": float(self.choke_stall_sec.value()),
            "humidity_field_name": self.humidity_field_name.text().strip() or "humidity",
            "distance_field_name": self.distance_field_name.text().strip() or "distance_mm",
            "temp_field_name": self.temp_field_name.text().strip() or "temp",
            "serial_csv_order": self.serial_csv_order.text().strip() or "humidity,distance_mm,temp",
            "serial_protocol_mode": self.serial_protocol_mode.currentText().strip().upper() or "AUTO",
            "distance_unit": self.distance_unit.currentText().strip().lower(),
            "distance_scale": float(self.distance_scale.value()),
            "distance_offset_mm": float(self.distance_offset_mm.value()),
            "humidity_min_valid": float(self.humidity_min_valid.value()),
            "humidity_max_valid": float(self.humidity_max_valid.value()),
            "distance_min_valid": float(self.distance_min_valid.value()),
            "distance_max_valid": float(self.distance_max_valid.value()),
        }

    def _validate_patch(self, patch: dict) -> list[str]:
        errors: list[str] = []

        if float(patch["distance_empty_mm"]) <= float(patch["distance_full_mm"]):
            errors.append("A distância de reservatório vazio deve ser maior que a de reservatório cheio.")
        if float(patch["distance_scale"]) <= 0.0:
            errors.append("A escala da distância deve ser maior que zero.")
        if float(patch["distance_min_valid"]) > float(patch["distance_max_valid"]):
            errors.append("A faixa válida de distância está invertida (mínimo > máximo).")
        if float(patch["humidity_min_valid"]) > float(patch["humidity_max_valid"]):
            errors.append("A faixa válida de umidade está invertida (mínimo > máximo).")
        if not str(patch["humidity_field_name"]).strip():
            errors.append("O campo de umidade não pode ficar vazio.")
        if not str(patch["distance_field_name"]).strip():
            errors.append("O campo de distância não pode ficar vazio.")
        if not str(patch["temp_field_name"]).strip():
            errors.append("O campo de temperatura não pode ficar vazio.")
        if not (0.0 <= float(patch["anomaly_threshold"]) <= 1.0):
            errors.append("O limiar de anomalia deve ficar entre 0.0 e 1.0.")
        if float(patch["max_on_sec"]) <= 0.0:
            errors.append("O tempo máximo ligado deve ser maior que zero.")
        if float(patch["min_off_sec"]) < 0.0:
            errors.append("O tempo mínimo desligado não pode ser negativo.")
        if float(patch["cooldown_sec"]) < 0.0:
            errors.append("O cooldown não pode ser negativo.")
        if str(patch["actuation_mode"]).upper() not in ("MANUAL", "AUTO"):
            errors.append("Modo de atuação inválido: use MANUAL ou AUTO.")

        return errors

    def _update_summary(self) -> None:
        calib_ok = self.distance_empty_mm.value() > self.distance_full_mm.value()
        calib_state = "consistente" if calib_ok else "inconsistente"

        self.summary_label.setText(
            "Resumo ativo: "
            f"origem={self.source_type.currentText()} | "
            f"campos={self.humidity_field_name.text().strip()}/{self.distance_field_name.text().strip()} | "
            f"escala={self.distance_scale.value():.3f} | "
            f"correção={self.distance_offset_mm.value():.1f} mm | "
            f"faixa umidade={self.humidity_min_valid.value():.1f}..{self.humidity_max_valid.value():.1f} | "
            f"faixa distância={self.distance_min_valid.value():.1f}..{self.distance_max_valid.value():.1f} mm | "
            f"calibração vazio/cheio={self.distance_empty_mm.value():.1f}/{self.distance_full_mm.value():.1f} mm ({calib_state})"
        )

        anomaly_state = "ON" if bool(self._effective_phase2.get("anomaly_enabled", False)) else "OFF"
        act_state = "ON" if bool(self._effective_phase2.get("actuation_enabled", False)) else "OFF"
        act_mode = str(self._effective_phase2.get("actuation_mode", "MANUAL"))
        thr = float(self._effective_phase2.get("anomaly_threshold", 0.8))
        max_on = float(self._effective_phase2.get("max_on_sec", 30.0))
        min_off = float(self._effective_phase2.get("min_off_sec", 10.0))
        cooldown = float(self._effective_phase2.get("cooldown_sec", 5.0))

        self.phase2_summary_label.setText(
            "Fase 2 efetiva: "
            f"anomalia={anomaly_state} (limiar={thr:.3f}) | "
            f"atuação={act_state} modo={act_mode} | "
            f"max_on={max_on:.1f}s min_off={min_off:.1f}s cooldown={cooldown:.1f}s"
        )

        # faixa superior
        self.source_summary_value.setText(self.source_type.currentText())
        self.phase1_summary_value.setText(f"{int(self.sample_period_ms.value())} ms")
        self.phase2_status_value.setText(
            f"anomalia {'ON' if bool(self._effective_phase2.get('anomaly_enabled', False)) else 'OFF'} / "
            f"atuação {'ON' if bool(self._effective_phase2.get('actuation_enabled', False)) else 'OFF'}"
        )
        self.calibration_summary_value.setText(
            f"{self.distance_empty_mm.value():.0f}/{self.distance_full_mm.value():.0f} mm"
        )

    def _update_context_enabled_states(self) -> None:
        source_type = self.source_type.currentText().strip().upper()
        is_serial = source_type == "SERIAL"
        is_replay = source_type == "REPLAY"

        for field in (self.serial_port, self.baudrate, self.serial_timeout_sec, self.serial_protocol_mode):
            field.setEnabled(is_serial)

        for field in (self.replay_path, self.replay_loop):
            field.setEnabled(is_replay)

        anomaly_on = bool(self.anomaly_enabled.isChecked())
        self.anomaly_threshold.setEnabled(anomaly_on)

        act_on = bool(self.actuation_enabled.isChecked())
        for field in (self.actuation_mode, self.max_on_sec, self.min_off_sec, self.cooldown_sec):
            field.setEnabled(act_on)

    def _capture_distance(self, kind: str) -> None:
        ts = datetime.now().strftime("%H:%M:%S")

        if not callable(self.on_capture_reading):
            self.feedback_label.setText(f"[{ts}] Captura indisponível: callback não configurado.")
            return

        snap = self.on_capture_reading()
        if not isinstance(snap, dict):
            self.feedback_label.setText(f"[{ts}] Captura indisponível: sem snapshot atual.")
            return

        distance_mm = snap.get("distance_mm")
        if distance_mm is None:
            self.feedback_label.setText(f"[{ts}] Captura falhou: leitura de distância indisponível.")
            return

        if kind == "empty":
            self.distance_empty_mm.setValue(float(distance_mm))
            self.feedback_label.setText(f"[{ts}] Capturado vazio={float(distance_mm):.1f} mm da leitura atual.")
        else:
            self.distance_full_mm.setValue(float(distance_mm))
            self.feedback_label.setText(f"[{ts}] Capturado cheio={float(distance_mm):.1f} mm da leitura atual.")

        self._update_summary()

    def _capture_empty_from_live(self) -> None:
        self._capture_distance("empty")

    def _capture_full_from_live(self) -> None:
        self._capture_distance("full")

    def render_operational(self, snapshot) -> None:
        if snapshot is None:
            self.calibration_runtime_label.setText("Leitura operacional: sem snapshot.")
            self.operational_state_label.setText("Aceite operacional: sem avaliação.")
            return

        st = snapshot.status
        sample = snapshot.latest_sample

        dist = getattr(st, "latest_distance_mm", None)
        level = getattr(st, "latest_level_pct", None)
        source_status = str(getattr(st, "source_status", "OK"))
        validity = str(getattr(st, "data_validity_hint", "VALID"))
        flags = list(getattr(sample, "flags", []) or [])

        has_stuck = any(
            str(f).startswith("SERIAL_REPEAT") or str(f) == "SENSOR_STUCK_SUSPECT"
            for f in flags
        )

        calib_ok = self.distance_empty_mm.value() > self.distance_full_mm.value()
        if not calib_ok:
            op_state = "INCOERENTE (calibração inválida)"
        elif source_status in ("DOWN", "TIMEOUT"):
            op_state = "SEM_DADOS"
        elif has_stuck:
            op_state = "DEGRADADA (sensor possivelmente travado)"
        elif validity != "VALID":
            op_state = "DEGRADADA (leitura ruidosa/incompleta)"
        else:
            op_state = "VÁLIDA"

        anomaly_enabled = bool(self._effective_phase2.get("anomaly_enabled", False))
        anomaly_state = str(getattr(st, "anomaly_state", "DISABLED"))
        act_enabled = bool(self._effective_phase2.get("actuation_enabled", False))
        act_mode = str(self._effective_phase2.get("actuation_mode", "MANUAL"))
        actuator_state = str(getattr(st, "actuation_state", "OFF"))

        phase2_runtime = []
        phase2_runtime.append("anomalia=DISABLED" if not anomaly_enabled else f"anomalia={anomaly_state}")
        if not act_enabled:
            phase2_runtime.append("atuação=DESABILITADA")
        elif act_mode == "MANUAL":
            phase2_runtime.append(f"atuação=MANUAL ({actuator_state})")
        else:
            phase2_runtime.append(f"atuação=AUTO ({actuator_state})")

        dist_txt = f"{float(dist):.1f} mm" if dist is not None else "-"
        lvl_txt = f"{float(level):.1f} %" if level is not None else "-"

        self.calibration_runtime_label.setText(
            f"Leitura operacional: distância_normalizada={dist_txt} | nível_estimado={lvl_txt} | "
            f"calibração ativa vazio/cheio={self.distance_empty_mm.value():.1f}/{self.distance_full_mm.value():.1f} mm | "
            f"scale={self.distance_scale.value():.3f} | offset={self.distance_offset_mm.value():.1f} mm | "
            f"validade={validity} | fonte={source_status}"
        )
        self.operational_state_label.setText(
            f"Aceite operacional: {op_state}. Fase 2 runtime: {' | '.join(phase2_runtime)}."
        )

    def _restore_defaults(self) -> None:
        self.load_from_cfg(Config())
        self.feedback_label.setText("Valores padrão seguros restaurados. Revise e clique em Aplicar.")

    def _apply(self):
        patch = self._collect_patch()
        errors = self._validate_patch(patch)
        ts = datetime.now().strftime("%H:%M:%S")

        if errors:
            self.feedback_label.setText(f"[{ts}] Configuração inválida: " + " ".join(errors))
            return

        result = self.on_apply(patch)
        events = self._coerce_events(result)
        has_fail = any(str(getattr(e, "kind", "")) == "FAIL" for e in events)
        has_config_changed = any(str(getattr(e, "kind", "")) == "CONFIG_CHANGED" for e in events)

        msg = f"[{ts}] "
        if has_config_changed and not has_fail:
            msg += "Config aplicada."
        elif has_fail:
            msg += "Config aplicada com falhas."
        else:
            msg += "Config aplicada."

        if isinstance(result, dict):
            if result.get("sample_period_changed"):
                msg += f" Timer atualizado ({patch['sample_period_ms']} ms)."
            if result.get("source_changed"):
                msg += " Source rebuild aplicado." if result.get("source_rebuilt") else " Source alterada sem rebuild."

        self.feedback_label.setText(msg)
        self._update_summary()

    def _apply_and_connect(self):
        patch = self._collect_patch()
        errors = self._validate_patch(patch)
        ts = datetime.now().strftime("%H:%M:%S")

        if errors:
            self.feedback_label.setText(f"[{ts}] Configuração inválida: " + " ".join(errors))
            return

        if str(patch.get("source_type", "")).upper() != "SERIAL":
            self.feedback_label.setText(f"[{ts}] Origem deve ser SERIAL para conectar sensor.")
            return

        if not str(patch.get("serial_port", "")).strip():
            self.feedback_label.setText(f"[{ts}] Porta serial não preenchida.")
            return

        if callable(self.on_apply_and_connect):
            result = self.on_apply_and_connect(patch)
            if isinstance(result, str):
                self.feedback_label.setText(f"[{ts}] {result}")
            else:
                self.feedback_label.setText(f"[{ts}] Config aplicada e conexão serial solicitada.")
        else:
            self.feedback_label.setText(f"[{ts}] Callback de conexão não disponível.")

        self._update_summary()
