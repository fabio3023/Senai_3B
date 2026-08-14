import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATABASE_GLOBAL_KEY = Symbol.for("sesi-times.databases");

const schema = `
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    nickname TEXT,
    category TEXT NOT NULL,
    season INTEGER NOT NULL CHECK (season BETWEEN 2000 AND 2100),
    description TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'activity' CHECK (kind IN ('game', 'training', 'activity')),
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    result TEXT,
    published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    caption TEXT,
    published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS team_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    team_name TEXT NOT NULL,
    nickname TEXT,
    category TEXT NOT NULL,
    season INTEGER NOT NULL CHECK (season BETWEEN 2000 AND 2100),
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS events_team_id_idx ON events(team_id);
  CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events(starts_at);
  CREATE INDEX IF NOT EXISTS news_team_id_idx ON news(team_id);
  CREATE INDEX IF NOT EXISTS news_published_at_idx ON news(published_at);
  CREATE INDEX IF NOT EXISTS gallery_team_id_idx ON gallery(team_id);
  CREATE INDEX IF NOT EXISTS team_requests_status_idx ON team_requests(status);
`;

function resolveDatabasePath() {
  const configuredPath = process.env.SESI_DB_PATH?.trim();

  if (configuredPath === ":memory:") {
    return configuredPath;
  }

  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    configuredPath || "data/sesi-times.db",
  );
}

function migrate(database) {
  database.exec("BEGIN IMMEDIATE");

  try {
    database.exec(schema);
    database.exec("PRAGMA user_version = 1");
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seed(database) {
  database.exec("BEGIN IMMEDIATE");

  try {
    database.prepare(`
      INSERT INTO teams (slug, name, nickname, category, season, description, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(slug) DO NOTHING
    `).run(
      "3b",
      "Terceiro Médio B",
      "The Best",
      "Ensino Médio",
      2026,
      "União, atitude e vontade de evoluir em cada novo desafio.",
    );

    database.prepare(`
      INSERT INTO news (team_id, slug, title, summary, body, published_at, published)
      VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(slug) DO NOTHING
    `).run(
      "lancamento-do-portal-sesi-times",
      "Portal SESI Times está no ar",
      "O novo portal reúne os times e as novidades da comunidade escolar em um só lugar.",
      "O SESI Times foi lançado para apresentar as equipes da escola e publicar informações confirmadas sobre suas atividades. Novos conteúdos serão adicionados conforme forem validados.",
    );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function createDatabase(databasePath) {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new DatabaseSync(databasePath);
  if (typeof database.enableDefensive === "function") {
    database.enableDefensive(true);
  }
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA synchronous = NORMAL");
  migrate(database);
  seed(database);
  return database;
}

export function getDatabase() {
  const databasePath = resolveDatabasePath();
  const databases = globalThis[DATABASE_GLOBAL_KEY] || new Map();

  if (!globalThis[DATABASE_GLOBAL_KEY]) {
    globalThis[DATABASE_GLOBAL_KEY] = databases;
  }

  if (!databases.has(databasePath)) {
    databases.set(databasePath, createDatabase(databasePath));
  }

  return databases.get(databasePath);
}
