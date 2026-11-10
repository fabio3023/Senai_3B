'use client';

import { useEffect, useState } from "react";
import Cabecalho from "@/components/header";
import estilos from "./cadastros.module.css";

const diasDaSemana = [
  { valor: "segunda", rotulo: "Segunda" },
  { valor: "terca", rotulo: "Terça" },
  { valor: "quarta", rotulo: "Quarta" },
  { valor: "quinta", rotulo: "Quinta" },
  { valor: "sexta", rotulo: "Sexta" },
  { valor: "sabado", rotulo: "Sábado" },
  { valor: "domingo", rotulo: "Domingo" },
];

const disciplinaInicial = { nome: "", pontuacao_minima: "" };
const professorInicial = {
  nome: "",
  matricula_nif: "",
  dias_aula: [],
  total_aulas_semana: "",
  disciplina_id: "",
};

async function requisitar(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível concluir o cadastro.");
  return dados;
}

export default function CadastroProfessores() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplina, setDisciplina] = useState(disciplinaInicial);
  const [professor, setProfessor] = useState(professorInicial);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();
    async function carregarCadastros() {
      try {
        const [disciplinasSalvas, professoresSalvos] = await Promise.all([
          requisitar("/api/disciplinas", { cache: "no-store", signal: controlador.signal }),
          requisitar("/api/professores", { cache: "no-store", signal: controlador.signal }),
        ]);
        setDisciplinas(disciplinasSalvas);
        setProfessores(professoresSalvos);
      } catch (falha) {
        if (!controlador.signal.aborted) setErro(falha.message || "Não foi possível carregar os cadastros.");
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }
    carregarCadastros();
    return () => controlador.abort();
  }, []);

  function atualizarDisciplina(evento) {
    const { name, value } = evento.target;
    setErro("");
    setSucesso("");
    setDisciplina((atual) => ({ ...atual, [name]: value }));
  }

  function atualizarProfessor(evento) {
    const { name, value, checked } = evento.target;
    setErro("");
    setSucesso("");
    if (name === "dias_aula") {
      setProfessor((atual) => ({
        ...atual,
        dias_aula: checked
          ? [...atual.dias_aula, value]
          : atual.dias_aula.filter((dia) => dia !== value),
      }));
      return;
    }
    setProfessor((atual) => ({ ...atual, [name]: value }));
  }

  async function salvarDisciplina(evento) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro("");
    setSucesso("");
    try {
      const resultado = await requisitar("/api/disciplinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...disciplina, pontuacao_minima: Number(disciplina.pontuacao_minima) }),
      });
      setDisciplinas((atuais) => [...atuais, resultado.disciplina].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setProfessor((atual) => ({ ...atual, disciplina_id: String(resultado.disciplina.id_disciplina) }));
      setDisciplina(disciplinaInicial);
      setSucesso("Disciplina cadastrada com sucesso. Agora ela pode ser vinculada a um professor.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível cadastrar a disciplina.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarProfessor(evento) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro("");
    setSucesso("");
    try {
      const resultado = await requisitar("/api/professores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...professor,
          total_aulas_semana: Number(professor.total_aulas_semana),
          disciplina_id: Number(professor.disciplina_id),
        }),
      });
      setProfessores((atuais) => [...atuais, {
        ...resultado.professor,
        disciplina_nome: disciplinas.find((item) => item.id_disciplina === resultado.professor.disciplina_id)?.nome,
      }]);
      setProfessor(professorInicial);
      setSucesso("Professor cadastrado com sucesso.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível cadastrar o professor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className={estilos.pagina}>
        <section className={estilos.introducao} aria-labelledby="titulo-pagina">
          <span className={estilos.destaque}>Gestão acadêmica</span>
          <h2 id="titulo-pagina">Professores e disciplinas</h2>
          <p>Cadastre as disciplinas e vincule cada professor à matéria sob sua responsabilidade.</p>
          <div className={estilos.cartaoInformativo}>
            <span className={estilos.iconeInformativo} aria-hidden="true">✓</span>
            <div>
              <strong>Cadastro integrado</strong>
              <p>A disciplina é cadastrada primeiro e selecionada no formulário do professor.</p>
            </div>
          </div>
          <div className={estilos.etapas} aria-label="Etapas do cadastro">
            <div className={estilos.etapa}><span>01</span><div><strong>Disciplina</strong><small>Nome e pontuação mínima</small></div></div>
            <div className={estilos.etapa}><span>02</span><div><strong>Professor</strong><small>Matrícula, dias e aulas semanais</small></div></div>
          </div>
        </section>

        <div className={estilos.formularios}>
          <section className={estilos.cartaoFormulario} aria-labelledby="titulo-disciplina">
            <div className={estilos.cabecalhoFormulario}>
              <div><span>Etapa 01</span><h3 id="titulo-disciplina">Cadastrar disciplina</h3></div>
              <span className={estilos.obrigatorio}>* Obrigatório</span>
            </div>
            <form onSubmit={salvarDisciplina}>
              <fieldset className={estilos.formulario} disabled={carregando || salvando}>
                <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                  <label htmlFor="nome-disciplina">Nome da disciplina <span>*</span></label>
                  <input id="nome-disciplina" name="nome" value={disciplina.nome} onChange={atualizarDisciplina}
                    placeholder="Ex.: Matemática" required />
                </div>
                <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                  <label htmlFor="pontuacao-minima">Pontuação mínima para passar <span>*</span></label>
                  <input id="pontuacao-minima" name="pontuacao_minima" type="number" min="0" max="10" step="0.1"
                    value={disciplina.pontuacao_minima} onChange={atualizarDisciplina} placeholder="Ex.: 6" required />
                </div>
                <div className={estilos.acoes}>
                  <button type="submit" className={estilos.botaoPrimario}>
                    {salvando ? "Salvando..." : "Cadastrar disciplina"} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </fieldset>
            </form>
          </section>

          <section className={estilos.cartaoFormulario} aria-labelledby="titulo-professor">
            <div className={estilos.cabecalhoFormulario}>
              <div><span>Etapa 02</span><h3 id="titulo-professor">Cadastrar professor</h3></div>
              <span className={estilos.obrigatorio}>* Obrigatório</span>
            </div>
            {carregando && <p role="status">Carregando cadastros...</p>}
            <form onSubmit={salvarProfessor}>
              <fieldset className={estilos.formulario} disabled={carregando || salvando}>
                <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                  <label htmlFor="nome-professor">Nome do professor <span>*</span></label>
                  <input id="nome-professor" name="nome" value={professor.nome} onChange={atualizarProfessor}
                    placeholder="Digite o nome completo" autoComplete="name" required />
                </div>
                <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                  <label htmlFor="matricula-nif">Matrícula (NIF) <span>*</span></label>
                  <input id="matricula-nif" name="matricula_nif" value={professor.matricula_nif} onChange={atualizarProfessor}
                    placeholder="Digite a matrícula ou NIF" required />
                </div>
                <fieldset className={`${estilos.campo} ${estilos.dias}`} disabled={carregando || salvando}>
                  <legend>Dias que ministra aula <span>*</span></legend>
                  <div className={estilos.opcoesDias}>
                    {diasDaSemana.map((dia) => (
                      <label key={dia.valor}>
                        <input type="checkbox" name="dias_aula" value={dia.valor}
                          checked={professor.dias_aula.includes(dia.valor)} onChange={atualizarProfessor} />
                        {dia.rotulo}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className={estilos.campo}>
                  <label htmlFor="total-aulas">Total de aulas na semana <span>*</span></label>
                  <input id="total-aulas" name="total_aulas_semana" type="number" min="1" step="1"
                    value={professor.total_aulas_semana} onChange={atualizarProfessor} placeholder="Ex.: 20" required />
                </div>
                <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                  <label htmlFor="disciplina-professor">Disciplina responsável <span>*</span></label>
                  <select id="disciplina-professor" name="disciplina_id" value={professor.disciplina_id}
                    onChange={atualizarProfessor} required>
                    <option value="">Selecione uma disciplina</option>
                    {disciplinas.map((item) => (
                      <option key={item.id_disciplina} value={item.id_disciplina}>
                        {item.nome} (mínimo {item.pontuacao_minima})
                      </option>
                    ))}
                  </select>
                  {!disciplinas.length && <small>Cadastre uma disciplina acima para continuar.</small>}
                </div>
                <div className={estilos.acoes}>
                  <button type="submit" className={estilos.botaoPrimario}>
                    {salvando ? "Salvando..." : "Cadastrar professor"} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </fieldset>
            </form>
          </section>

          {erro && <p className={estilos.erro} role="alert">{erro}</p>}
          {sucesso && <p className={estilos.sucesso} role="status">{sucesso}</p>}
          {!!professores.length && (
            <section className={estilos.listaProfessores} aria-labelledby="titulo-lista">
              <h3 id="titulo-lista">Professores cadastrados</h3>
              <ul>
                {professores.map((item) => (
                  <li key={item.id_professor}>
                    <strong>{item.nome}</strong>
                    <span>{item.disciplina_nome} · {item.total_aulas_semana} aulas/semana</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
