import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const databasePath = process.env.ESCOLA_DB_PATH
  || path.join(process.cwd(), "src", "app", "db", "escola.db");

mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

// Inicialização aditiva: preserva os registros de bancos já existentes.
db.exec(`
  CREATE TABLE IF NOT EXISTS alunos (
    id_aluno INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
    idade INTEGER NOT NULL CHECK (typeof(idade) = 'integer' AND idade BETWEEN 1 AND 120),
    serie TEXT NOT NULL CHECK (length(trim(serie)) > 0),
    ra TEXT NOT NULL UNIQUE CHECK (length(trim(ra)) > 0)
  );
  CREATE TABLE IF NOT EXISTS notas (
    id_notas INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    t1 REAL NOT NULL,
    t2 REAL NOT NULL,
    n1 REAL NOT NULL,
    n2 REAL NOT NULL,
    n3 REAL NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id_aluno) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_alunos_nome ON alunos(nome);
  CREATE INDEX IF NOT EXISTS idx_notas_aluno_id ON notas(aluno_id);
`);

export default db;
