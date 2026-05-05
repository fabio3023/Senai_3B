import sys
from pathlib import Path

from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from system.app.ui.style import apply_theme
from system.app.ui.window import MainWindow
from system.core.config import load_config
from system.core.controller import Controller


ICON_DIR = Path(__file__).resolve().parent / "ui" / "assets" / "icons"


def main() -> None:
    app = QApplication(sys.argv)
    app.setWindowIcon(QIcon(str(ICON_DIR / "vale.svg")))

    apply_theme(app)

    cfg = load_config()
    controller = Controller.from_config(cfg)

    window = MainWindow(controller, cfg)
    window.setWindowIcon(QIcon(str(ICON_DIR / "vale.svg")))
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
