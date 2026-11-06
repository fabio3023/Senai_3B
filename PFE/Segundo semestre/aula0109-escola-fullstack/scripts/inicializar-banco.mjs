import banco from "../src/lib/server/db/banco.js";

try {
  console.log(`Banco pronto: ${banco.name}`);
  console.log("Tabelas:", banco.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all());
  console.log("Integridade:", banco.pragma("integrity_check"));
} finally {
  banco.close();
}
