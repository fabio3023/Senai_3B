from __future__ import annotations

from PySide6.QtCore import QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QColor, QPalette
from PySide6.QtWidgets import QApplication, QGraphicsOpacityEffect, QWidget
import pyqtgraph as pg

_SEVERITIES = {"OK", "WARN", "ALERT", "FAIL"}

# ── Base palette: darker, more graphite, less blue ──────────────────────────
BG_DEEP        = "#040608"
BG_BASE        = "#070A0E"
BG_CANVAS      = "#0B0F14"
BG_SURFACE     = "#121820"
BG_RAISED      = "#171E27"
BG_SOFT        = "#0D1218"
BG_INSET       = "#0A0F14"

# ── Layer / panel gradients ──────────────────────────────────────────────────
CARD_TOP       = "#1A212B"
CARD_MID       = "#161C24"
CARD_BOT       = "#121821"

SIDEBAR_TOP    = "#151B24"
SIDEBAR_BOT    = "#10151D"

PANEL_TOP      = "#1A212B"
PANEL_BOT      = "#121821"

# ── Borders / separators ─────────────────────────────────────────────────────
BORDER_DIM     = "#27313D"
BORDER_MID     = "#354354"
BORDER_HI      = "#4A5D74"
LINE_SOFT      = "#202A35"
LINE_STRONG    = "#313D4C"

# ── Text ─────────────────────────────────────────────────────────────────────
TEXT_PRI       = "#F3F5F7"
TEXT_SEC       = "#C8CFD8"
TEXT_DIM       = "#8D96A3"
TEXT_FAINT     = "#697383"

# ── Brand accents ────────────────────────────────────────────────────────────
GREEN          = "#18A56B"
GREEN_HI       = "#35C887"
GREEN_SOFT     = "#73E3AA"
GREEN_BG       = "#0F271B"
GREEN_BORDER   = "#1E6943"

AMBER          = "#D8A61C"
AMBER_HI       = "#F0B81F"
AMBER_SOFT     = "#FFD25A"
AMBER_BG       = "#332607"
AMBER_BORDER   = "#8A6513"

RED            = "#C85A55"
RED_HI         = "#DF7973"
RED_BG         = "#2D1414"
RED_BORDER     = "#7A3131"

CYAN           = "#2EA7CC"
CYAN_HI        = "#55C6E6"
CYAN_BG        = "#10222B"
CYAN_BORDER    = "#2E6E82"

VIOLET_BG      = "#23172D"
VIOLET_BORDER  = "#684A81"

# ── Neutral actions ──────────────────────────────────────────────────────────
NEUTRAL_BG     = "#1B222C"
NEUTRAL_HOVER  = "#232C38"
NEUTRAL_PRESS  = "#141A22"
NEUTRAL_BORDER = "#3B4858"

# ── Sidebar ──────────────────────────────────────────────────────────────────
SIDEBAR_ITEM_HOVER = "#1B222C"
SIDEBAR_ITEM_SEL   = "#202834"
SIDEBAR_SEL_BORDER = "#566274"
SIDEBAR_DIVIDER    = "#25303C"

# ── Charts ───────────────────────────────────────────────────────────────────
CHART_BG       = "#0C1117"
CHART_GRID     = "#27323E"


def apply_theme(app: QApplication) -> None:
    app.setStyle("Fusion")

    palette = QPalette()
    palette.setColor(QPalette.ColorRole.Window,          QColor(BG_BASE))
    palette.setColor(QPalette.ColorRole.WindowText,      QColor(TEXT_PRI))
    palette.setColor(QPalette.ColorRole.Base,            QColor(BG_SOFT))
    palette.setColor(QPalette.ColorRole.AlternateBase,   QColor(BG_SURFACE))
    palette.setColor(QPalette.ColorRole.ToolTipBase,     QColor(BG_RAISED))
    palette.setColor(QPalette.ColorRole.ToolTipText,     QColor(TEXT_PRI))
    palette.setColor(QPalette.ColorRole.Text,            QColor(TEXT_PRI))
    palette.setColor(QPalette.ColorRole.Button,          QColor(BG_SURFACE))
    palette.setColor(QPalette.ColorRole.ButtonText,      QColor(TEXT_PRI))
    palette.setColor(QPalette.ColorRole.Highlight,       QColor(AMBER))
    palette.setColor(QPalette.ColorRole.HighlightedText, QColor("#111111"))
    app.setPalette(palette)

    app.setStyleSheet(f"""
        /* ── Base ─────────────────────────────────────────── */
        QWidget {{
            font-family: "Segoe UI", "Inter", "Roboto", "Arial";
            font-size: 10pt;
            color: {TEXT_PRI};
            background: transparent;
        }}

        QMainWindow, QDialog {{
            background: {BG_DEEP};
        }}

        QWidget#AppShell {{
            background: {BG_DEEP};
        }}

        /* ── Sidebar ──────────────────────────────────────── */
        QFrame#Sidebar {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 {SIDEBAR_TOP},
                stop:1 {SIDEBAR_BOT}
            );
            border: 1px solid {BORDER_DIM};
            border-right: 1px solid {LINE_STRONG};
            border-radius: 10px;
        }}

        QLabel#SidebarBrand {{
            font-size: 22pt;
            font-weight: 900;
            color: {TEXT_PRI};
            letter-spacing: 0.4px;
            padding: 2px 0 0 0;
        }}

        QLabel#SidebarSubtle {{
            font-size: 8.5pt;
            color: {TEXT_DIM};
            letter-spacing: 0.7px;
            text-transform: uppercase;
            padding-bottom: 6px;
            border-bottom: 1px solid {SIDEBAR_DIVIDER};
        }}

        QListWidget#SidebarNav {{
            border: none;
            outline: none;
            background: transparent;
            color: {TEXT_SEC};
            font-size: 10.5pt;
            padding: 4px 0;
        }}

        QListWidget#SidebarNav::item {{
            background: transparent;
            border: 1px solid transparent;
            border-radius: 8px;
            margin: 4px 0;
            padding: 13px 16px;
            min-height: 22px;
        }}

        QListWidget#SidebarNav::item:hover {{
            background: {SIDEBAR_ITEM_HOVER};
            border-color: {BORDER_DIM};
            color: {TEXT_PRI};
        }}

        QListWidget#SidebarNav::item:selected {{
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:0,
                stop:0 #26303D,
                stop:1 {SIDEBAR_ITEM_SEL}
            );
            border: 1px solid {SIDEBAR_SEL_BORDER};
            color: #FFFFFF;
            font-weight: 800;
            padding-left: 18px;
        }}

        /* ── Titles ───────────────────────────────────────── */
        QLabel#PageTitle {{
            font-size: 20pt;
            font-weight: 900;
            color: {TEXT_PRI};
            padding: 2px 0 8px 0;
            letter-spacing: 0.1px;
        }}

        QLabel#SectionTitle {{
            font-size: 10.5pt;
            font-weight: 800;
            color: {TEXT_PRI};
            padding: 4px 0 4px 0;
        }}

        QLabel#SectionEyebrow {{
            font-size: 8.5pt;
            font-weight: 800;
            color: {TEXT_DIM};
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding: 0;
        }}

        /* ── Text hierarchy ───────────────────────────────── */
        QLabel#CardTitle {{
            font-size: 8.5pt;
            font-weight: 800;
            color: {TEXT_DIM};
            letter-spacing: 0.7px;
            text-transform: uppercase;
            padding: 0;
        }}

        QLabel#CardValue {{
            font-size: 22pt;
            font-weight: 900;
            color: {TEXT_PRI};
            padding: 0;
        }}

        QLabel#CardValueSm {{
            font-size: 12pt;
            font-weight: 800;
            color: {TEXT_PRI};
            padding: 0;
        }}

        QLabel#CardSubtle {{
            font-size: 9pt;
            color: {TEXT_SEC};
            line-height: 1.35;
        }}

        QLabel#DiagLabel {{
            font-size: 9pt;
            font-family: "Consolas", "Courier New", monospace;
            color: {TEXT_SEC};
        }}

        QLabel#BadgeLabel {{
            font-size: 8.5pt;
            font-weight: 900;
            letter-spacing: 0.35px;
            padding: 4px 10px;
            border-radius: 6px;
        }}

        QLabel#PanelTitle {{
            font-size: 13pt;
            font-weight: 900;
            color: {TEXT_PRI};
            padding: 0;
        }}

        QLabel#PanelSubtle {{
            font-size: 8.5pt;
            color: {TEXT_DIM};
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }}

        /* ── Cards / panels ──────────────────────────────── */
        QFrame[card="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:1,
                stop:0 {CARD_TOP},
                stop:0.58 {CARD_MID},
                stop:1 {CARD_BOT}
            );
            border: 1px solid {BORDER_DIM};
            border-radius: 9px;
        }}

        QFrame[card="true"]:hover {{
            border-color: {BORDER_MID};
        }}

        QFrame[metric="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:1,
                stop:0 #1B222D,
                stop:1 #121821
            );
            border: 1px solid {BORDER_MID};
            border-radius: 9px;
        }}

        QFrame[panel="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:1,
                stop:0 {PANEL_TOP},
                stop:1 {PANEL_BOT}
            );
            border: 1px solid {BORDER_DIM};
            border-radius: 9px;
        }}

        QFrame[flatpanel="true"] {{
            background: {BG_SURFACE};
            border: 1px solid {BORDER_DIM};
            border-radius: 8px;
        }}

        /* ── GroupBox ─────────────────────────────────────── */
        QGroupBox {{
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:1,
                stop:0 {PANEL_TOP},
                stop:1 {PANEL_BOT}
            );
            border: 1px solid {BORDER_DIM};
            border-radius: 9px;
            margin-top: 14px;
            padding-top: 10px;
            font-size: 9.5pt;
            font-weight: 800;
            color: {TEXT_SEC};
        }}

        QGroupBox::title {{
            subcontrol-origin: margin;
            subcontrol-position: top left;
            left: 14px;
            top: 0px;
            padding: 0 7px;
            color: {TEXT_PRI};
            letter-spacing: 0.3px;
        }}

        /* ── Buttons ──────────────────────────────────────── */
        QPushButton {{
            background: {NEUTRAL_BG};
            border: 1px solid {NEUTRAL_BORDER};
            border-radius: 7px;
            padding: 8px 15px;
            min-height: 32px;
            font-weight: 800;
            font-size: 9.5pt;
            color: {TEXT_PRI};
        }}

        QPushButton:hover {{
            background: {NEUTRAL_HOVER};
            border-color: {BORDER_MID};
            color: #FFFFFF;
        }}

        QPushButton:pressed {{
            background: {NEUTRAL_PRESS};
            border-color: {BORDER_HI};
        }}

        QPushButton:disabled {{
            background: {BG_SURFACE};
            border-color: {BORDER_DIM};
            color: {TEXT_DIM};
        }}

        QPushButton[primary="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #263241,
                stop:1 #1C2530
            );
            border: 1px solid #506074;
            color: {TEXT_PRI};
        }}

        QPushButton[primary="true"]:hover {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #2D394A,
                stop:1 #202A36
            );
            border-color: #62768E;
            color: #FFFFFF;
        }}

        QPushButton[success="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #153722,
                stop:1 {GREEN_BG}
            );
            border: 1px solid {GREEN_BORDER};
            color: #D8FFE9;
        }}

        QPushButton[success="true"]:hover {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #1A452B,
                stop:1 #123120
            );
            border-color: {GREEN_HI};
            color: #FFFFFF;
        }}

        QPushButton[danger="true"] {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 {AMBER_HI},
                stop:1 {AMBER}
            );
            border: 1px solid #C99617;
            color: #111111;
        }}

        QPushButton[danger="true"]:hover {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #FFD158,
                stop:1 {AMBER_HI}
            );
            border-color: #E0B13A;
            color: #000000;
        }}

        /* ── Inputs ───────────────────────────────────────── */
        QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox {{
            background: {BG_INSET};
            border: 1px solid {BORDER_DIM};
            border-radius: 7px;
            padding: 7px 10px;
            min-height: 30px;
            color: {TEXT_PRI};
            selection-background-color: {AMBER};
        }}

        QLineEdit:hover, QComboBox:hover, QSpinBox:hover, QDoubleSpinBox:hover {{
            border-color: {BORDER_MID};
            background: #0B1016;
        }}

        QLineEdit:focus, QComboBox:focus, QSpinBox:focus, QDoubleSpinBox:focus {{
            border-color: {AMBER_BORDER};
            background: #0A1015;
        }}

        QComboBox::drop-down {{
            border: none;
            width: 24px;
        }}

        QComboBox QAbstractItemView {{
            background: {BG_RAISED};
            border: 1px solid {BORDER_MID};
            border-radius: 7px;
            selection-background-color: #25303D;
            color: {TEXT_PRI};
            outline: none;
        }}

        QAbstractSpinBox::up-button, QAbstractSpinBox::down-button {{
            width: 18px;
            border: none;
            background: transparent;
        }}

        QCheckBox {{
            color: {TEXT_PRI};
            spacing: 7px;
        }}

        QCheckBox::indicator {{
            width: 14px;
            height: 14px;
            border: 1px solid {BORDER_MID};
            border-radius: 3px;
            background: {BG_INSET};
        }}

        QCheckBox::indicator:checked {{
            background: {GREEN};
            border-color: {GREEN};
        }}

        QCheckBox::indicator:hover {{
            border-color: {GREEN_HI};
        }}

        /* ── Tabs ─────────────────────────────────────────── */
        QTabWidget::pane {{
            border: 1px solid {BORDER_DIM};
            background: {BG_CANVAS};
            border-radius: 0 8px 8px 8px;
            top: -1px;
        }}

        QTabBar::tab {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 {BG_SURFACE},
                stop:1 {CARD_BOT}
            );
            border: 1px solid {BORDER_DIM};
            border-bottom: none;
            padding: 9px 16px;
            margin-right: 3px;
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            color: {TEXT_SEC};
            font-size: 9.25pt;
            font-weight: 800;
        }}

        QTabBar::tab:selected {{
            background: {BG_CANVAS};
            border-color: {BORDER_HI};
            color: {TEXT_PRI};
        }}

        QTabBar::tab:hover:!selected {{
            background: {BG_RAISED};
            border-color: {BORDER_MID};
            color: {TEXT_PRI};
        }}

        /* ── Tables / logs ───────────────────────────────── */
        QTableWidget {{
            background: {BG_INSET};
            alternate-background-color: {BG_SURFACE};
            border: 1px solid {BORDER_DIM};
            gridline-color: {LINE_SOFT};
            border-radius: 8px;
            color: {TEXT_PRI};
            selection-background-color: #26313D;
        }}

        QHeaderView::section {{
            background: qlineargradient(
                x1:0, y1:0, x2:0, y2:1,
                stop:0 #202734,
                stop:1 #171E28
            );
            border: 0;
            border-right: 1px solid {LINE_SOFT};
            border-bottom: 1px solid {BORDER_MID};
            padding: 9px 10px;
            font-weight: 900;
            font-size: 8.8pt;
            color: {TEXT_SEC};
            letter-spacing: 0.35px;
        }}

        QTableCornerButton::section {{
            background: #1D2430;
            border: 0;
            border-right: 1px solid {LINE_SOFT};
            border-bottom: 1px solid {BORDER_MID};
        }}

        /* ── Lists / tree / simple logs ──────────────────── */
        QListView, QListWidget, QTreeWidget {{
            background: transparent;
            outline: none;
        }}

        QTreeWidget {{
            border: 1px solid {BORDER_DIM};
            border-radius: 8px;
            background: {BG_INSET};
        }}

        QTreeWidget::item {{
            padding: 6px 4px;
            border-bottom: 1px solid {LINE_SOFT};
        }}

        QTreeWidget::item:selected {{
            background: #24303B;
        }}

        /* ── Scrollbars ───────────────────────────────────── */
        QScrollBar:vertical {{
            width: 8px;
            background: transparent;
            margin: 0;
        }}

        QScrollBar::handle:vertical {{
            background: {BORDER_DIM};
            min-height: 24px;
            border-radius: 4px;
            margin: 1px;
        }}

        QScrollBar::handle:vertical:hover {{
            background: {BORDER_MID};
        }}

        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical,
        QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
            background: transparent;
            border: none;
            height: 0;
        }}

        QScrollBar:horizontal {{
            height: 8px;
            background: transparent;
        }}

        QScrollBar::handle:horizontal {{
            background: {BORDER_DIM};
            min-width: 24px;
            border-radius: 4px;
            margin: 1px;
        }}

        QScrollBar::handle:horizontal:hover {{
            background: {BORDER_MID};
        }}

        QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal,
        QScrollBar::add-page:horizontal, QScrollBar::sub-page:horizontal {{
            background: transparent;
            border: none;
            width: 0;
        }}

        QScrollArea {{
            border: none;
            background: transparent;
        }}

        /* ── Forms ────────────────────────────────────────── */
        QFormLayout QLabel {{
            color: {TEXT_SEC};
            font-size: 9pt;
            padding-right: 10px;
        }}

        /* ── Status / severity ───────────────────────────── */
        QWidget[severity="OK"] {{
            background: {GREEN_BG};
            border: 1px solid {GREEN_BORDER};
            color: #D6FFEA;
            border-radius: 7px;
        }}

        QWidget[severity="WARN"] {{
            background: {AMBER_BG};
            border: 1px solid {AMBER_BORDER};
            color: #FFE8AF;
            border-radius: 7px;
        }}

        QWidget[severity="ALERT"] {{
            background: {RED_BG};
            border: 1px solid {RED_BORDER};
            color: #FFD9D7;
            border-radius: 7px;
        }}

        QWidget[severity="FAIL"] {{
            background: {VIOLET_BG};
            border: 1px solid {VIOLET_BORDER};
            color: #F3DDFF;
            border-radius: 7px;
        }}

        /* ── Tooltip ──────────────────────────────────────── */
        QToolTip {{
            background: {BG_RAISED};
            border: 1px solid {BORDER_MID};
            color: {TEXT_PRI};
            padding: 6px 9px;
            border-radius: 6px;
            font-size: 9pt;
        }}
    """)

    pg.setConfigOptions(antialias=True)
    pg.setConfigOption("background", CHART_BG)
    pg.setConfigOption("foreground", TEXT_SEC)


def set_severity(widget: QWidget, severity: str) -> None:
    normalized = (severity or "FAIL").upper()
    if normalized not in _SEVERITIES:
        normalized = "FAIL"
    widget.setProperty("severity", normalized)
    widget.style().unpolish(widget)
    widget.style().polish(widget)
    widget.update()


def fade_in(widget: QWidget, duration: int = 220) -> None:
    effect = QGraphicsOpacityEffect(widget)
    widget.setGraphicsEffect(effect)
    anim = QPropertyAnimation(effect, b"opacity", widget)
    anim.setDuration(duration)
    anim.setStartValue(0.0)
    anim.setEndValue(1.0)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)


def severity_color(severity: str) -> str:
    return {
        "OK": GREEN,
        "WARN": AMBER,
        "ALERT": RED,
        "FAIL": "#C97BFF",
    }.get((severity or "FAIL").upper(), RED)
