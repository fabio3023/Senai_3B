import db from "../src/app/db/banco.js";

try {
  console.log(`Banco pronto: ${db.name}`);
  console.log("Tabelas:", db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all());
  console.log("Integridade:", db.pragma("integrity_check"));
} finally {
  db.close();
}
