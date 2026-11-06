import banco from "../db/banco.js";

function responderErro(mensagem, status) {
  return Response.json({ mensagem }, { status });
}

function tratarErro(falha) {
  if (falha instanceof SyntaxError) return responderErro("Envie um JSON válido.", 400);
  if (falha.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return responderErro("Já existe um aluno com este RA.", 409);
  }

  console.error("Erro ao acessar os alunos:", falha);
  return responderErro("Não foi possível concluir a operação no banco de dados.", 500);
}

function validarAluno(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return null;

  const { nome, idade, serie, ra } = dados;
  if ([nome, serie, ra].some((valor) => typeof valor !== "string" || !valor.trim())) {
    return null;
  }
  if (typeof idade !== "number" && typeof idade !== "string") return null;

  const idadeNumerica = Number(idade);
  if (!Number.isInteger(idadeNumerica) || idadeNumerica < 1 || idadeNumerica > 120) {
    return null;
  }

  return {
    nome: nome.trim(),
    idade: idadeNumerica,
    serie: serie.trim(),
    ra: ra.trim(),
  };
}

async function lerId(contexto) {
  const { id } = await contexto.params;
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
    ? Number(id)
    : null;
}

export async function listarAlunos() {
  try {
    const alunos = banco.prepare("SELECT * FROM alunos ORDER BY nome, id_aluno").all();
    const notas = banco.prepare("SELECT * FROM notas ORDER BY id_notas").all();
    const notasPorAluno = new Map();

    for (const nota of notas) {
      const { aluno_id, t1, t2, n1, n2, n3 } = nota;
      notasPorAluno.set(aluno_id, { t1, t2, n1, n2, n3 });
    }

    return Response.json(alunos.map((aluno) => ({
      ...aluno,
      notas: notasPorAluno.get(aluno.id_aluno) || null,
    })));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function buscarAluno(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID do aluno inválido.", 400);

    const aluno = banco.prepare("SELECT * FROM alunos WHERE id_aluno = ?").get(id);
    return aluno ? Response.json(aluno) : responderErro("Aluno não encontrado.", 404);
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function salvarAlunos(requisicao) {
  try {
    const aluno = validarAluno(await requisicao.json());
    if (!aluno) {
      return responderErro("Informe nome, série, RA e idade inteira entre 1 e 120.", 400);
    }

    const resultado = banco.prepare(
      "INSERT INTO alunos (nome, idade, serie, ra) VALUES (@nome, @idade, @serie, @ra)",
    ).run(aluno);

    return Response.json({
      mensagem: "Aluno salvo com sucesso!",
      aluno: { id_aluno: Number(resultado.lastInsertRowid), ...aluno },
    }, { status: 201 });
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function editarAlunos(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID do aluno inválido.", 400);

    const aluno = validarAluno(await requisicao.json());
    if (!aluno) {
      return responderErro("Informe nome, série, RA e idade inteira entre 1 e 120.", 400);
    }

    const resultado = banco.prepare(`
      UPDATE alunos SET nome = @nome, idade = @idade, serie = @serie, ra = @ra
      WHERE id_aluno = @id
    `).run({ ...aluno, id });

    if (!resultado.changes) return responderErro("Aluno não encontrado.", 404);
    return Response.json({
      mensagem: "Aluno editado com sucesso!",
      aluno: { id_aluno: id, ...aluno },
    });
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function excluirAlunos(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID do aluno inválido.", 400);

    const resultado = banco.prepare("DELETE FROM alunos WHERE id_aluno = ?").run(id);
    if (!resultado.changes) return responderErro("Aluno não encontrado.", 404);
    return Response.json({ mensagem: "Aluno e suas notas foram excluídos com sucesso!" });
  } catch (falha) {
    return tratarErro(falha);
  }
}
