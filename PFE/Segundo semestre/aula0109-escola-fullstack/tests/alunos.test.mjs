import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const directory = mkdtempSync(path.join(tmpdir(), "escola-test-"));
process.env.ESCOLA_DB_PATH = path.join(directory, "escola.db");
const { default: db } = await import("../src/lib/server/db/banco.js");
const { GET: listar, POST: salvar } = await import("../src/app/api/alunos/route.js");
const { GET: buscar, PUT: editar, DELETE: excluir } = await import("../src/app/api/alunos/[id]/route.js");
const { GET: listarNotas, POST: salvarNota } = await import("../src/app/api/notas/route.js");
const {
  GET: buscarNota,
  PUT: editarNota,
  DELETE: excluirNota,
} = await import("../src/app/api/notas/[id]/route.js");
const { GET: listarDisciplinas, POST: salvarDisciplina } = await import("../src/app/api/disciplinas/route.js");
const { GET: listarProfessores, POST: salvarProfessor } = await import("../src/app/api/professores/route.js");

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

test("cadastra notas para um aluno e valida vínculo e valores", async () => {
  const { aluno } = await (await salvar(request({ ...ana, ra: "00888" }))).json();
  const dados = { aluno_id: aluno.id_aluno, t1: 8.5, t2: 9, n1: 7, n2: 8, n3: 10 };
  const response = await salvarNota(request(dados));
  assert.equal(response.status, 201);
  const resultado = await response.json();
  assert.deepEqual(resultado.nota, { id_notas: resultado.nota.id_notas, ...dados });
  assert.equal((await (await listar()).json()).find((item) => item.id_aluno === aluno.id_aluno).notas.t1, 8.5);
  assert.equal(db.prepare("SELECT count(*) AS total FROM notas WHERE aluno_id = ?").get(aluno.id_aluno).total, 1);

  for (const nota of [
    { ...dados, aluno_id: 999999 },
    { ...dados, t1: -0.1 },
    { ...dados, n2: 10.1 },
    { ...dados, n3: "inválida" },
    { ...dados, t2: "" },
    { ...dados, n1: undefined },
  ]) {
    assert.equal((await salvarNota(request(nota))).status, nota.aluno_id === 999999 ? 404 : 400);
  }
  const malformed = new Request("http://localhost/api/notas", { method: "POST", body: "{" });
  assert.equal((await salvarNota(malformed)).status, 400);
  assert.equal(db.prepare("SELECT count(*) AS total FROM notas WHERE aluno_id = ?").get(aluno.id_aluno).total, 1);
});

test("lista, consulta, edita e exclui notas pelo ID", async () => {
  const { aluno } = await (await salvar(request({ ...ana, nome: "Carla", ra: "00889" }))).json();
  const dadosIniciais = { aluno_id: aluno.id_aluno, t1: 6, t2: 7, n1: 8, n2: 9, n3: 10 };
  const cadastro = await (await salvarNota(request(dadosIniciais))).json();

  const listaDeNotas = await (await listarNotas()).json();
  const item = listaDeNotas.find((nota) => nota.id_notas === cadastro.nota.id_notas);
  assert.equal(item.nome, "Carla");
  assert.equal(item.ra, "00889");

  const consulta = await buscarNota(null, contexto(cadastro.nota.id_notas));
  assert.equal(consulta.status, 200);
  assert.equal((await consulta.json()).t1, 6);

  const dadosEditados = { ...dadosIniciais, t1: 9.5, n3: 8.5 };
  const edicao = await editarNota(request(dadosEditados, "PUT"), contexto(cadastro.nota.id_notas));
  assert.equal(edicao.status, 200);
  assert.equal((await edicao.json()).nota.t1, 9.5);
  assert.equal((await (await buscarNota(null, contexto(cadastro.nota.id_notas))).json()).n3, 8.5);

  for (const id of ["abc", "0", "-1", "1.5"]) {
    assert.equal((await buscarNota(null, contexto(id))).status, 400);
    assert.equal((await editarNota(request(dadosEditados, "PUT"), contexto(id))).status, 400);
    assert.equal((await excluirNota(null, contexto(id))).status, 400);
  }

  assert.equal((await buscarNota(null, contexto(999999))).status, 404);
  assert.equal((await editarNota(request(dadosEditados, "PUT"), contexto(999999))).status, 404);
  assert.equal((await excluirNota(null, contexto(999999))).status, 404);
  assert.equal((await excluirNota(null, contexto(cadastro.nota.id_notas))).status, 200);
  assert.equal((await buscarNota(null, contexto(cadastro.nota.id_notas))).status, 404);
});

test("cadastra disciplinas e professores com vínculo, validações e restrições únicas", async () => {
  const dadosDisciplina = { nome: "  Ciências  ", pontuacao_minima: 6.5 };
  const cadastroDisciplina = await salvarDisciplina(request(dadosDisciplina));
  assert.equal(cadastroDisciplina.status, 201);
  const { disciplina } = await cadastroDisciplina.json();
  assert.deepEqual(disciplina, {
    id_disciplina: disciplina.id_disciplina,
    nome: "Ciências",
    pontuacao_minima: 6.5,
  });

  assert.equal((await salvarDisciplina(request(dadosDisciplina))).status, 409);
  for (const dados of [
    null,
    [],
    {},
    { nome: " ", pontuacao_minima: 5 },
    { nome: "História", pontuacao_minima: -1 },
    { nome: "História", pontuacao_minima: 10.1 },
    { nome: "História", pontuacao_minima: "inválida" },
  ]) {
    assert.equal((await salvarDisciplina(request(dados))).status, 400);
  }

  const dadosProfessor = {
    nome: "  Joana Lima ",
    matricula_nif: " NIF-001 ",
    dias_aula: ["segunda", "quarta"],
    total_aulas_semana: 18,
    disciplina_id: disciplina.id_disciplina,
  };
  const cadastroProfessor = await salvarProfessor(request(dadosProfessor));
  assert.equal(cadastroProfessor.status, 201);
  const { professor } = await cadastroProfessor.json();
  assert.deepEqual(professor, {
    id_professor: professor.id_professor,
    nome: "Joana Lima",
    matricula_nif: "NIF-001",
    dias_aula: ["segunda", "quarta"],
    total_aulas_semana: 18,
    disciplina_id: disciplina.id_disciplina,
  });
  assert.equal((await salvarProfessor(request(dadosProfessor))).status, 409);

  const listaDisciplinas = await (await listarDisciplinas()).json();
  assert.equal(listaDisciplinas.some((item) => item.id_disciplina === disciplina.id_disciplina), true);
  const listaProfessores = await (await listarProfessores()).json();
  assert.deepEqual(listaProfessores.find((item) => item.id_professor === professor.id_professor), {
    ...professor,
    disciplina_nome: "Ciências",
  });

  for (const dados of [
    { ...dadosProfessor, matricula_nif: "NIF-002", dias_aula: [] },
    { ...dadosProfessor, matricula_nif: "NIF-002", dias_aula: ["fundamental"] },
    { ...dadosProfessor, matricula_nif: "NIF-002", dias_aula: ["segunda", "segunda"] },
    { ...dadosProfessor, matricula_nif: "NIF-002", total_aulas_semana: 0 },
    { ...dadosProfessor, matricula_nif: "NIF-002", total_aulas_semana: 1.5 },
    { ...dadosProfessor, matricula_nif: "NIF-002", disciplina_id: 999999 },
  ]) {
    assert.equal((await salvarProfessor(request(dados))).status, dados.disciplina_id === 999999 ? 404 : 400);
  }
  assert.deepEqual(db.pragma("foreign_key_check"), []);
});
