import banco from "../db/banco.js";

const camposDeNota = ["t1", "t2", "n1", "n2", "n3"];

function responderErro(mensagem, status) {
  return Response.json({ mensagem }, { status });
}

function tratarErro(falha) {
  if (falha instanceof SyntaxError) {
    return responderErro("Envie um JSON válido.", 400);
  }
  if (falha.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return responderErro("Aluno não encontrado.", 404);
  }

  console.error("Erro ao acessar as notas:", falha);
  return responderErro("Não foi possível concluir a operação no banco de dados.", 500);
}

function validarDadosDaNota(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return null;

  const alunoId = Number(dados.aluno_id ?? dados.id_aluno);
  if (!Number.isSafeInteger(alunoId) || alunoId < 1) return null;

  const notas = {};
  for (const campo of camposDeNota) {
    const valor = dados[campo];
    if ((typeof valor !== "number" && typeof valor !== "string")
      || (typeof valor === "string" && !valor.trim())) return null;

    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0 || numero > 10) return null;
    notas[campo] = numero;
  }

  return { aluno_id: alunoId, ...notas };
}

async function lerId(contexto) {
  const { id } = await contexto.params;
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
    ? Number(id)
    : null;
}

function alunoExiste(idAluno) {
  return Boolean(banco.prepare("SELECT 1 FROM alunos WHERE id_aluno = ?").get(idAluno));
}

export async function listarNotas() {
  try {
    const notas = banco.prepare(`
      SELECT
        notas.id_notas,
        notas.aluno_id,
        notas.t1,
        notas.t2,
        notas.n1,
        notas.n2,
        notas.n3,
        alunos.nome,
        alunos.ra,
        alunos.serie
      FROM notas
      INNER JOIN alunos ON alunos.id_aluno = notas.aluno_id
      ORDER BY alunos.nome, notas.id_notas DESC
    `).all();

    return Response.json(notas);
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function buscarNota(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID da nota inválido.", 400);

    const nota = banco.prepare(`
      SELECT
        notas.id_notas,
        notas.aluno_id,
        notas.t1,
        notas.t2,
        notas.n1,
        notas.n2,
        notas.n3,
        alunos.nome,
        alunos.ra,
        alunos.serie
      FROM notas
      INNER JOIN alunos ON alunos.id_aluno = notas.aluno_id
      WHERE notas.id_notas = ?
    `).get(id);

    return nota ? Response.json(nota) : responderErro("Nota não encontrada.", 404);
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function salvarNota(requisicao) {
  try {
    const nota = validarDadosDaNota(await requisicao.json());
    if (!nota) {
      return responderErro("Informe um aluno válido e notas entre 0 e 10.", 400);
    }
    if (!alunoExiste(nota.aluno_id)) return responderErro("Aluno não encontrado.", 404);

    const resultado = banco.prepare(`
      INSERT INTO notas (aluno_id, t1, t2, n1, n2, n3)
      VALUES (@aluno_id, @t1, @t2, @n1, @n2, @n3)
    `).run(nota);

    return Response.json({
      mensagem: "Notas cadastradas com sucesso!",
      nota: { id_notas: Number(resultado.lastInsertRowid), ...nota },
    }, { status: 201 });
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function editarNota(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID da nota inválido.", 400);

    const nota = validarDadosDaNota(await requisicao.json());
    if (!nota) {
      return responderErro("Informe um aluno válido e notas entre 0 e 10.", 400);
    }
    if (!alunoExiste(nota.aluno_id)) return responderErro("Aluno não encontrado.", 404);

    const resultado = banco.prepare(`
      UPDATE notas
      SET aluno_id = @aluno_id, t1 = @t1, t2 = @t2, n1 = @n1, n2 = @n2, n3 = @n3
      WHERE id_notas = @id
    `).run({ ...nota, id });

    if (!resultado.changes) return responderErro("Nota não encontrada.", 404);
    return Response.json({
      mensagem: "Notas atualizadas com sucesso!",
      nota: { id_notas: id, ...nota },
    });
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function excluirNota(requisicao, contexto) {
  try {
    const id = await lerId(contexto);
    if (!id) return responderErro("ID da nota inválido.", 400);

    const resultado = banco.prepare("DELETE FROM notas WHERE id_notas = ?").run(id);
    if (!resultado.changes) return responderErro("Nota não encontrada.", 404);
    return Response.json({ mensagem: "Notas excluídas com sucesso!" });
  } catch (falha) {
    return tratarErro(falha);
  }
}
