from __future__ import annotations

from dataclasses import dataclass
import random
import time

from system.core.models import Config, Sample


@dataclass
class SimSource:
    cfg: Config
    source_id: str = "SIM"

    def __post_init__(self) -> None:
        self._i = 0
        self._t0 = time.time()
        self._rng = random.Random(42)
        self._distance = float(self.cfg.distance_empty_mm) - 10.0

    def _phase_delta_mm(self, phase_tick: int) -> float:
        # ciclo de 320 ticks: normal -> desaceleração -> choke -> recuperação
        if phase_tick < 120:  # normal flow: distância cai (nível sobe)
            return -2.6
        if phase_tick < 180:  # slow flow
            return -0.9
        if phase_tick < 250:  # choke/stall window
            return 0.0
        return -2.1  # recover

    def _distance_to_level(self, distance_mm: float) -> float:
        span = max(1.0, float(self.cfg.distance_empty_mm) - float(self.cfg.distance_full_mm))
        pct = 100.0 * (float(self.cfg.distance_empty_mm) - distance_mm) / span
        return max(0.0, min(100.0, pct))

    def read(self) -> Sample:
        dt = self.cfg.sample_period_ms / 1000.0
        ts = self._t0 + self._i * dt

        phase = self._i % 320
        cycle = self._i // 320

        delta = self._phase_delta_mm(phase)
        noise = self._rng.uniform(-0.4, 0.4)
        if 180 <= phase < 250:
            noise = self._rng.uniform(-0.05, 0.05)

        self._distance += delta + noise

        # ao final do ciclo faz reset para manter timeline cíclica visível
        if phase == 319:
            self._distance = float(self.cfg.distance_empty_mm) - (8.0 + (cycle % 5))

        self._distance = max(float(self.cfg.distance_full_mm), min(float(self.cfg.distance_empty_mm), self._distance))

        humidity_base = 52.0 + (cycle % 7) * 0.45
        humidity_wave = 3.5 * (1.0 if phase < 160 else -0.5)
        humidity_noise = self._rng.uniform(-0.35, 0.35)
        humidity = max(0.0, min(100.0, humidity_base + humidity_wave + humidity_noise))

        level_pct = self._distance_to_level(self._distance)
        weight = 48.0 + level_pct * 0.08

        flags: list[str] = []
        if 180 <= phase < 250:
            flags.append("STALL_WINDOW")
        elif 120 <= phase < 180:
            flags.append("SLOW_FLOW")

        self._i += 1
        return Sample(
            ts=ts,
            humidity=float(humidity),
            distance_mm=float(self._distance),
            level_pct=float(level_pct),
            weight=float(weight),
            source_id=self.source_id,
            flags=flags,
        )
