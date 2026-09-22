import db from "../db/banco.js";

function erro(mensagem, status) {
  return Response.json({ mensagem }, { status });
}

function tratarErro(error) {
  if (error instanceof SyntaxError) return erro("Envie um JSON válido.", 400);
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return erro("Já existe um aluno com este RA.", 409);
  }
  console.error("Erro ao acessar alunos:", error);
  return erro("Não foi possível concluir a operação no banco de dados.", 500);
}

function validarAluno(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return null;
  const { nome, idade, serie, ra } = dados;
  if ([nome, serie, ra].some((value) => typeof value !== "string" || !value.trim())) {
    return null;
  }
  if (typeof idade !== "number" && typeof idade !== "string") return null;
  const idadeNumero = Number(idade);
  if (!Number.isInteger(idadeNumero) || idadeNumero < 1 || idadeNumero > 120) return null;
  return { nome: nome.trim(), idade: idadeNumero, serie: serie.trim(), ra: ra.trim() };
}

async function lerId(context) {
  const { id } = await context.params;
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
    ? Number(id) : null;
}

export async function listarAlunos() {
  try {
    const alunos = db.prepare("SELECT * FROM alunos ORDER BY nome, id_aluno").all();
    const notas = db.prepare("SELECT * FROM notas ORDER BY id_notas").all();
    const notasPorAluno = new Map();
    for (const nota of notas) {
      const { aluno_id, t1, t2, n1, n2, n3 } = nota;
      // Mostra o último conjunto de notas cadastrado para cada aluno.
      notasPorAluno.set(aluno_id, { t1, t2, n1, n2, n3 });
    }
    return Response.json(alunos.map((aluno) => ({
      ...aluno, notas: notasPorAluno.get(aluno.id_aluno) || null,
    })));
  } catch (error) {
    return tratarErro(error);
  }
}

export async function buscarAluno(request, context) {
  try {
    const id = await lerId(context);
    if (!id) return erro("ID do aluno inválido.", 400);
    const aluno = db.prepare("SELECT * FROM alunos WHERE id_aluno = ?").get(id);
    return aluno ? Response.json(aluno) : erro("Aluno não encontrado.", 404);
  } catch (error) {
    return tratarErro(error);
  }
}

export async function salvarAlunos(request) {
  try {
    const aluno = validarAluno(await request.json());
    if (!aluno) return erro("Informe nome, série, RA e idade inteira entre 1 e 120.", 400);
    const resultado = db.prepare(
      "INSERT INTO alunos (nome, idade, serie, ra) VALUES (@nome, @idade, @serie, @ra)",
    ).run(aluno);
    return Response.json({
      mensagem: "Aluno salvo com sucesso!",
      aluno: { id_aluno: Number(resultado.lastInsertRowid), ...aluno },
    }, { status: 201 });
  } catch (error) {
    return tratarErro(error);
  }
}

export async function editarAlunos(request, context) {
  try {
    const id = await lerId(context);
    if (!id) return erro("ID do aluno inválido.", 400);
    const aluno = validarAluno(await request.json());
    if (!aluno) return erro("Informe nome, série, RA e idade inteira entre 1 e 120.", 400);
    const resultado = db.prepare(`
      UPDATE alunos SET nome = @nome, idade = @idade, serie = @serie, ra = @ra
      WHERE id_aluno = @id
    `).run({ ...aluno, id });
    if (!resultado.changes) return erro("Aluno não encontrado.", 404);
    return Response.json({
      mensagem: "Aluno editado com sucesso!", aluno: { id_aluno: id, ...aluno },
    });
  } catch (error) {
    return tratarErro(error);
  }
}

export async function excluirAlunos(request, context) {
  try {
    const id = await lerId(context);
    if (!id) return erro("ID do aluno inválido.", 400);
    const resultado = db.prepare("DELETE FROM alunos WHERE id_aluno = ?").run(id);
    if (!resultado.changes) return erro("Aluno não encontrado.", 404);
    return Response.json({ mensagem: "Aluno e suas notas excluídos com sucesso!" });
  } catch (error) {
    return tratarErro(error);
  }
}
