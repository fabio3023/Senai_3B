import banco from "../db/banco.js";

const diasValidos = new Set(["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]);

function responderErro(mensagem, status) {
  return Response.json({ mensagem }, { status });
}

function tratarErro(falha, recurso) {
  if (falha instanceof SyntaxError) return responderErro("Envie um JSON válido.", 400);
  if (falha.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return responderErro(recurso === "disciplina"
      ? "Já existe uma disciplina com este nome."
      : "Já existe um professor com esta matrícula (NIF).", 409);
  }
  if (falha.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return responderErro("Disciplina não encontrada.", 404);
  }

  console.error(`Erro ao acessar ${recurso === "disciplina" ? "as disciplinas" : "os professores"}:`, falha);
  return responderErro("Não foi possível concluir a operação no banco de dados.", 500);
}

function validarDisciplina(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return null;
  const { nome, pontuacao_minima: pontuacaoMinima } = dados;
  if (typeof nome !== "string" || !nome.trim()) return null;
  if ((typeof pontuacaoMinima !== "number" && typeof pontuacaoMinima !== "string")
    || (typeof pontuacaoMinima === "string" && !pontuacaoMinima.trim())) return null;

  const pontuacao = Number(pontuacaoMinima);
  if (!Number.isFinite(pontuacao) || pontuacao < 0 || pontuacao > 10) return null;
  return { nome: nome.trim(), pontuacao_minima: pontuacao };
}

function validarProfessor(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return null;
  const { nome, matricula_nif: matriculaNif, dias_aula: diasAula, total_aulas_semana: totalAulas, disciplina_id: disciplinaId } = dados;
  if ([nome, matriculaNif].some((valor) => typeof valor !== "string" || !valor.trim())) return null;
  if (!Array.isArray(diasAula) || !diasAula.length
    || diasAula.some((dia) => typeof dia !== "string" || !diasValidos.has(dia))
    || new Set(diasAula).size !== diasAula.length) return null;

  const total = Number(totalAulas);
  const disciplina = Number(disciplinaId);
  if (!Number.isSafeInteger(total) || total < 1) return null;
  if (!Number.isSafeInteger(disciplina) || disciplina < 1) return null;

  return {
    nome: nome.trim(),
    matricula_nif: matriculaNif.trim(),
    dias_aula: JSON.stringify(diasAula),
    total_aulas_semana: total,
    disciplina_id: disciplina,
  };
}

export async function listarDisciplinas() {
  try {
    return Response.json(banco.prepare(
      "SELECT id_disciplina, nome, pontuacao_minima FROM disciplinas ORDER BY nome, id_disciplina",
    ).all());
  } catch (falha) {
    return tratarErro(falha, "disciplina");
  }
}

export async function salvarDisciplina(requisicao) {
  try {
    const disciplina = validarDisciplina(await requisicao.json());
    if (!disciplina) return responderErro("Informe o nome e uma pontuação mínima entre 0 e 10.", 400);

    const resultado = banco.prepare(
      "INSERT INTO disciplinas (nome, pontuacao_minima) VALUES (@nome, @pontuacao_minima)",
    ).run(disciplina);
    return Response.json({
      mensagem: "Disciplina cadastrada com sucesso!",
      disciplina: { id_disciplina: Number(resultado.lastInsertRowid), ...disciplina },
    }, { status: 201 });
  } catch (falha) {
    return tratarErro(falha, "disciplina");
  }
}

export async function listarProfessores() {
  try {
    const professores = banco.prepare(`
      SELECT professores.id_professor, professores.nome, professores.matricula_nif,
        professores.dias_aula, professores.total_aulas_semana, professores.disciplina_id,
        disciplinas.nome AS disciplina_nome
      FROM professores
      INNER JOIN disciplinas ON disciplinas.id_disciplina = professores.disciplina_id
      ORDER BY professores.nome, professores.id_professor
    `).all();
    return Response.json(professores.map((professor) => ({
      ...professor,
      dias_aula: JSON.parse(professor.dias_aula),
    })));
  } catch (falha) {
    return tratarErro(falha, "professor");
  }
}

export async function salvarProfessor(requisicao) {
  try {
    const professor = validarProfessor(await requisicao.json());
    if (!professor) {
      return responderErro("Informe nome, matrícula (NIF), ao menos um dia de aula, total semanal positivo e uma disciplina válida.", 400);
    }

    const disciplinaExiste = banco.prepare(
      "SELECT 1 FROM disciplinas WHERE id_disciplina = ?",
    ).get(professor.disciplina_id);
    if (!disciplinaExiste) return responderErro("Disciplina não encontrada.", 404);

    const resultado = banco.prepare(`
      INSERT INTO professores (nome, matricula_nif, dias_aula, total_aulas_semana, disciplina_id)
      VALUES (@nome, @matricula_nif, @dias_aula, @total_aulas_semana, @disciplina_id)
    `).run(professor);
    return Response.json({
      mensagem: "Professor cadastrado com sucesso!",
      professor: {
        id_professor: Number(resultado.lastInsertRowid),
        ...professor,
        dias_aula: JSON.parse(professor.dias_aula),
      },
    }, { status: 201 });
  } catch (falha) {
    return tratarErro(falha, "professor");
  }
}
