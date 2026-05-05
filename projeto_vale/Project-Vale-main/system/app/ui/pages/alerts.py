from __future__ import annotations

from datetime import datetime
import json

from PySide6.QtCore import Qt
from PySide6.QtGui import QBrush, QColor
from PySide6.QtWidgets import (
    QComboBox,
    QFrame,
    QGridLayout,
    QHeaderView,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QWidget,
)


class AlertsPage(QWidget):
    def __init__(self, max_events: int = 1000):
        super().__init__()
        self._max_events = max_events
        self._rows: list[dict] = []

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(12)

        # ── Header ───────────────────────────────────────────
        title = QLabel("Alertas")
        title.setObjectName("PageTitle")

        subtitle = QLabel("Acompanhe eventos operacionais, falhas, pré-alertas e diagnósticos em tempo real.")
        subtitle.setObjectName("CardSubtle")
        subtitle.setWordWrap(True)

        root.addWidget(title)
        root.addWidget(subtitle)

        # ── Faixa de métricas ────────────────────────────────
        stats = QGridLayout()
        stats.setHorizontalSpacing(12)
        stats.setVerticalSpacing(12)

        total_card, self.total_events_value = self._metric_card("TOTAL", "Eventos", "0")
        critical_card, self.critical_events_value = self._metric_card("CRÍTICOS", "Alertas / Fail", "0")
        warn_card, self.warn_events_value = self._metric_card("WARN", "Warnings", "0")
        filter_card, self.filter_state_value = self._metric_card("FILTRO", "Visão atual", "ALL")

        stats.addWidget(total_card, 0, 0)
        stats.addWidget(critical_card, 0, 1)
        stats.addWidget(warn_card, 0, 2)
        stats.addWidget(filter_card, 0, 3)

        for i in range(4):
            stats.setColumnStretch(i, 1)

        root.addLayout(stats)

        # ── Barra de filtros ─────────────────────────────────
        filters_card = QFrame()
        filters_card.setProperty("card", "true")
        filters_layout = QVBoxLayout(filters_card)
        filters_layout.setContentsMargins(14, 12, 14, 12)
        filters_layout.setSpacing(10)

        filters_title = QLabel("Filtros e busca")
        filters_title.setObjectName("SectionTitle")
        filters_layout.addWidget(filters_title)

        filters_row = QHBoxLayout()
        filters_row.setSpacing(8)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Buscar por kind, message ou payload...")
        self.search_input.textChanged.connect(self._render_table)

        self.kind_filter = QComboBox()
        self.kind_filter.addItem("ALL")
        self.kind_filter.currentTextChanged.connect(self._render_table)

        clear_btn = QPushButton("Limpar")
        clear_btn.setProperty("primary", "true")
        clear_btn.clicked.connect(self._clear_filters)

        filters_row.addWidget(self.search_input, stretch=4)
        filters_row.addWidget(self.kind_filter, stretch=1)
        filters_row.addWidget(clear_btn)

        filters_layout.addLayout(filters_row)
        root.addWidget(filters_card)

        # ── Painel da tabela ─────────────────────────────────
        table_card = QFrame()
        table_card.setProperty("card", "true")
        table_layout = QVBoxLayout(table_card)
        table_layout.setContentsMargins(14, 12, 14, 12)
        table_layout.setSpacing(10)

        table_header = QHBoxLayout()
        table_header.setSpacing(8)

        table_title = QLabel("Log operacional")
        table_title.setObjectName("SectionTitle")

        self.table_count_label = QLabel("0 linhas")
        self.table_count_label.setObjectName("CardSubtle")
        self.table_count_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        table_header.addWidget(table_title)
        table_header.addStretch(1)
        table_header.addWidget(self.table_count_label)

        table_layout.addLayout(table_header)

        self.table = QTableWidget(0, 4)
        self.table.setHorizontalHeaderLabels(["ts", "kind", "message", "payload"])
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        self.table.verticalHeader().setVisible(False)
        self.table.setShowGrid(False)
        self.table.setWordWrap(False)
        self.table.setTextElideMode(Qt.TextElideMode.ElideRight)
        self.table.setSortingEnabled(False)

        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.Stretch)

        self.table.setColumnWidth(0, 92)
        self.table.setColumnWidth(1, 160)
        self.table.verticalHeader().setDefaultSectionSize(36)

        table_layout.addWidget(self.table)
        root.addWidget(table_card, stretch=1)

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

    def render(self, snap) -> None:
        if not getattr(snap, "events", None):
            self._update_stats()
            return

        kinds_updated = False

        for event in snap.events:
            payload_full = ""
            payload_short = ""

            if event.payload:
                payload_full = json.dumps(event.payload, ensure_ascii=False, separators=(",", ":"))
                payload_short = payload_full if len(payload_full) <= 180 else payload_full[:177] + "..."

            ts_raw = float(event.ts)
            ts_human = datetime.fromtimestamp(ts_raw).strftime("%H:%M:%S")

            row = {
                "ts": ts_human,
                "ts_raw": f"{ts_raw:.2f}",
                "kind": str(event.kind),
                "message": str(event.message),
                "payload": payload_short,
                "payload_full": payload_full,
            }

            self._rows.append(row)

            if self.kind_filter.findText(str(event.kind)) == -1:
                self.kind_filter.addItem(str(event.kind))
                kinds_updated = True

        if len(self._rows) > self._max_events:
            self._rows = self._rows[-self._max_events :]

        self._update_stats()
        self._render_table(keep_selection=not kinds_updated)

    def _clear_filters(self) -> None:
        self.search_input.clear()
        self.kind_filter.setCurrentText("ALL")

    def _update_stats(self) -> None:
        total = len(self._rows)
        critical = 0
        warn = 0

        for row in self._rows:
            sev = _kind_to_severity(row["kind"])
            if sev in {"ALERT", "FAIL"}:
                critical += 1
            elif sev == "WARN":
                warn += 1

        self.total_events_value.setText(str(total))
        self.critical_events_value.setText(str(critical))
        self.warn_events_value.setText(str(warn))
        self.filter_state_value.setText(self.kind_filter.currentText())

    def _render_table(self, *_args, keep_selection: bool = True) -> None:
        selected_row = self.table.currentRow() if keep_selection else -1

        term = self.search_input.text().strip().lower()
        kind = self.kind_filter.currentText()

        self.filter_state_value.setText(kind)

        if term:
            def matches_search(row: dict) -> bool:
                joined = f"{row['kind']} {row['message']} {row['payload_full']}".lower()
                return term in joined
        else:
            def matches_search(_row: dict) -> bool:
                return True

        filtered = [
            row for row in self._rows
            if (kind == "ALL" or row["kind"] == kind) and matches_search(row)
        ]

        self.table.setRowCount(len(filtered))
        self.table_count_label.setText(f"{len(filtered)} linhas")

        for idx, row in enumerate(filtered):
            severity = _kind_to_severity(row["kind"])
            color_fg, color_bg = _severity_colors(severity)

            ts_item = QTableWidgetItem(row["ts"])
            ts_item.setForeground(QBrush(QColor("#C8CFD8")))
            ts_item.setToolTip(row["ts_raw"])

            kind_item = QTableWidgetItem(row["kind"])
            kind_item.setForeground(QBrush(color_fg))
            kind_item.setBackground(QBrush(color_bg))
            kind_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            kind_item.setToolTip(row["kind"])

            msg_item = QTableWidgetItem(row["message"])
            msg_item.setForeground(QBrush(QColor("#F3F5F7")))
            msg_item.setToolTip(row["message"])

            payload_item = QTableWidgetItem(row["payload"])
            payload_item.setForeground(QBrush(QColor("#A7B0BB")))
            payload_item.setToolTip(row["payload_full"] or "—")

            self.table.setItem(idx, 0, ts_item)
            self.table.setItem(idx, 1, kind_item)
            self.table.setItem(idx, 2, msg_item)
            self.table.setItem(idx, 3, payload_item)

        if 0 <= selected_row < self.table.rowCount():
            self.table.selectRow(selected_row)

        self.table.scrollToBottom()


def _kind_to_severity(kind: str) -> str:
    k = (kind or "").upper()

    if "FAIL" in k:
        return "FAIL"
    if "CHOKE" in k:
        return "ALERT"
    if "ALERT" in k:
        return "ALERT"
    if "ANOMALY" in k:
        return "WARN"
    if "SOURCE_TIMEOUT" in k or "SERIAL_PARSE_FAIL" in k:
        return "WARN"
    if "WARN" in k or "PRE_ALERT" in k or "ATTENTION" in k or "RECOVERY" in k:
        return "WARN"
    return "OK"


def _severity_colors(severity: str) -> tuple[QColor, QColor]:
    if severity == "FAIL":
        return QColor("#F3DDFF"), QColor("#23172D")
    if severity == "ALERT":
        return QColor("#FFD9D7"), QColor("#2D1414")
    if severity == "WARN":
        return QColor("#FFE8AF"), QColor("#332607")
    return QColor("#D6FFEA"), QColor("#0F271B")
