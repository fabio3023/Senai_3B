CREATE TABLE IF NOT EXISTS public.leituras (
  id serial PRIMARY KEY,
  station_id varchar(100) NOT NULL,
  "timestamp" timestamptz NOT NULL,
  temperature_c double precision NOT NULL,
  humidity_pct double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ck_leituras_temperature
    CHECK (temperature_c >= -100 AND temperature_c <= 100),

  CONSTRAINT ck_leituras_humidity
    CHECK (humidity_pct >= 0 AND humidity_pct <= 100),

  CONSTRAINT uq_leituras_station_timestamp
    UNIQUE (station_id, "timestamp")
);

CREATE INDEX IF NOT EXISTS ix_leituras_timestamp
  ON public.leituras ("timestamp" DESC);

CREATE INDEX IF NOT EXISTS ix_leituras_station_id
  ON public.leituras (station_id);
