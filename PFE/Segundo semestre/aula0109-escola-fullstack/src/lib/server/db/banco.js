import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const caminhoBanco = process.env.ESCOLA_DB_PATH
  || path.join(process.cwd(), "data", "escola.db");

mkdirSync(path.dirname(caminhoBanco), { recursive: true });

const banco = new Database(caminhoBanco);
banco.pragma("foreign_keys = ON");
banco.pragma("busy_timeout = 5000");

// A inicialização é aditiva e preserva os registros do banco existente.
banco.exec(`
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
    t1 REAL NOT NULL CHECK (t1 BETWEEN 0 AND 10),
    t2 REAL NOT NULL CHECK (t2 BETWEEN 0 AND 10),
    n1 REAL NOT NULL CHECK (n1 BETWEEN 0 AND 10),
    n2 REAL NOT NULL CHECK (n2 BETWEEN 0 AND 10),
    n3 REAL NOT NULL CHECK (n3 BETWEEN 0 AND 10),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id_aluno) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_alunos_nome ON alunos(nome);
  CREATE INDEX IF NOT EXISTS idx_notas_aluno_id ON notas(aluno_id);
`);

export default banco;
