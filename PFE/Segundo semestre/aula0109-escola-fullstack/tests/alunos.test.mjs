import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const directory = mkdtempSync(path.join(tmpdir(), "escola-test-"));
process.env.ESCOLA_DB_PATH = path.join(directory, "escola.db");
const { default: db } = await import("../src/app/db/banco.js");
const { GET: listar, POST: salvar } = await import("../src/app/api/alunos/route.js");
const { GET: buscar, PUT: editar, DELETE: excluir } = await import("../src/app/api/alunos/[id]/route.js");

after(() => {
  db.close();
  unlinkSync(process.env.ESCOLA_DB_PATH);
  rmdirSync(directory);
  delete process.env.ESCOLA_DB_PATH;
});

const contexto = (id) => ({ params: Promise.resolve({ id: String(id) }) });
const request = (dados, method = "POST") => new Request("http://localhost/api/alunos", {
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados),
});
const ana = { nome: "Ana", idade: 17, serie: "3B", ra: "00123" };

test("CRUD persiste alterações, preserva outros alunos e exclui notas em cascata", async () => {
  assert.deepEqual(await (await listar()).json(), []);
  const response = await salvar(request(ana));
  assert.equal(response.status, 201);
  const { aluno } = await response.json();
  const outro = await (await salvar(request({ ...ana, nome: "Bruno", ra: "00456" }))).json();
  const notas = db.prepare("INSERT INTO notas (aluno_id, t1, t2, n1, n2, n3) VALUES (?, 8, 9, 7, 8, 10)");
  notas.run(aluno.id_aluno);
  notas.run(outro.aluno.id_aluno);

  const atualizado = { ...ana, nome: "Ana Editada", idade: 18, serie: "3A", ra: "00789" };
  assert.equal((await editar(request(atualizado, "PUT"), contexto(aluno.id_aluno))).status, 200);
  assert.deepEqual(await (await buscar(null, contexto(aluno.id_aluno))).json(), {
    id_aluno: aluno.id_aluno, ...atualizado,
  });
  // Outra conexão confirma que os dados foram gravados no arquivo SQLite.
  const leitura = new Database(process.env.ESCOLA_DB_PATH, { readonly: true });
  try {
    assert.equal(leitura.prepare("SELECT nome FROM alunos WHERE id_aluno = ?").get(aluno.id_aluno).nome, atualizado.nome);
  } finally {
    leitura.close();
  }
  const lista = await (await listar()).json();
  assert.deepEqual(lista.map((item) => item.nome), ["Ana Editada", "Bruno"]);
  assert.equal(lista[0].notas.t1, 8);

  assert.equal((await excluir(null, contexto(aluno.id_aluno))).status, 200);
  assert.equal((await buscar(null, contexto(aluno.id_aluno))).status, 404);
  assert.equal(db.prepare("SELECT count(*) AS total FROM notas WHERE aluno_id = ?").get(aluno.id_aluno).total, 0);
  assert.equal(db.prepare("SELECT count(*) AS total FROM notas WHERE aluno_id = ?").get(outro.aluno.id_aluno).total, 1);
  assert.equal((await buscar(null, contexto(outro.aluno.id_aluno))).status, 200);
  assert.deepEqual(db.pragma("foreign_key_check"), []);
});

test("RA duplicado retorna 409 sem alterar o aluno", async () => {
  assert.equal((await salvar(request({ ...ana, ra: "00456" }))).status, 409);
  const { aluno } = await (await salvar(request({ ...ana, ra: "00999" }))).json();
  assert.equal((await editar(request({ ...ana, ra: "00456" }, "PUT"), contexto(aluno.id_aluno))).status, 409);
  assert.equal((await (await buscar(null, contexto(aluno.id_aluno))).json()).ra, "00999");
});

test("valida campos, JSON, IDs e alunos inexistentes", async () => {
  for (const dados of [null, [], {}, { ...ana, nome: " " }, { ...ana, ra: 123 }, { ...ana, idade: true }, { ...ana, idade: 1.5 }, { ...ana, idade: 0 }, { ...ana, idade: 121 }]) {
    assert.equal((await salvar(request(dados))).status, 400);
    assert.equal((await editar(request(dados, "PUT"), contexto(2))).status, 400);
  }
  const malformed = new Request("http://localhost/api/alunos", { method: "POST", body: "{" });
  assert.equal((await salvar(malformed)).status, 400);
  for (const id of ["abc", "1 OR 1=1", "-1", "0", "1.5", "9007199254740992"]) {
    assert.equal((await buscar(null, contexto(id))).status, 400);
    assert.equal((await editar(request(ana, "PUT"), contexto(id))).status, 400);
    assert.equal((await excluir(null, contexto(id))).status, 400);
  }
  assert.equal((await editar(request(ana, "PUT"), contexto(999999))).status, 404);
  assert.equal((await excluir(null, contexto(999999))).status, 404);
});

test("normaliza espaços e mantém RA com zeros e nomes com apóstrofo", async () => {
  const { aluno } = await (await salvar(request({
    nome: "  D'Ávila  ", idade: "16", serie: " 2A ", ra: " 00001 ",
  }))).json();
  assert.deepEqual(aluno, { id_aluno: aluno.id_aluno, nome: "D'Ávila", idade: 16, serie: "2A", ra: "00001" });
  assert.equal((await (await listar()).json()).find((item) => item.id_aluno === aluno.id_aluno).notas, null);
});
