'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import estilos from "./cadnotas.module.css";

const formularioInicial = {
  aluno_id: "",
  t1: "",
  t2: "",
  n1: "",
  n2: "",
  n3: "",
};

const camposDeNota = [
  { nome: "t1", titulo: "T1", descricao: "Trabalho 1" },
  { nome: "t2", titulo: "T2", descricao: "Trabalho 2" },
  { nome: "n1", titulo: "N1", descricao: "Avaliação 1" },
  { nome: "n2", titulo: "N2", descricao: "Avaliação 2" },
  { nome: "n3", titulo: "N3", descricao: "Avaliação 3" },
];

export default function CadastroNotas() {
  return (
    <Suspense fallback={<p role="status">Carregando formulário...</p>}>
      <FormularioNotas />
    </Suspense>
  );
}

function FormularioNotas() {
  const parametrosBusca = useSearchParams();
  const roteador = useRouter();
  const idNota = parametrosBusca.get("editar");
  const editando = idNota !== null;

  const [formulario, setFormulario] = useState(formularioInicial);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarDados() {
      try {
        if (editando && !/^[1-9]\d*$/.test(idNota)) {
          throw new Error("ID da nota inválido.");
        }

        const requisicoes = [fetch("/api/alunos", {
          cache: "no-store",
          signal: controlador.signal,
        })];

        if (editando) {
          requisicoes.push(fetch(`/api/notas/${encodeURIComponent(idNota)}`, {
            cache: "no-store",
            signal: controlador.signal,
          }));
        }

        const respostas = await Promise.all(requisicoes);
        const dadosAlunos = await respostas[0].json();
        if (!respostas[0].ok) {
          throw new Error(dadosAlunos.mensagem || "Não foi possível carregar os alunos.");
        }
        setAlunos(dadosAlunos);

        if (editando) {
          const dadosNota = await respostas[1].json();
          if (!respostas[1].ok) {
            throw new Error(dadosNota.mensagem || "Não foi possível carregar as notas.");
          }
          setFormulario({
            aluno_id: String(dadosNota.aluno_id),
            t1: String(dadosNota.t1),
            t2: String(dadosNota.t2),
            n1: String(dadosNota.n1),
            n2: String(dadosNota.n2),
            n3: String(dadosNota.n3),
          });
        }
      } catch (falha) {
        if (!controlador.signal.aborted) {
          setErro(falha.message || "Não foi possível carregar o formulário.");
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarDados();
    return () => controlador.abort();
  }, [editando, idNota]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((dadosAtuais) => ({ ...dadosAtuais, [name]: value }));
    setMensagem("");
    setErro("");
  }

  async function salvarNotas(evento) {
    evento.preventDefault();
    if (salvando || carregando) return;

    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      const resposta = await fetch(editando
        ? `/api/notas/${encodeURIComponent(idNota)}`
        : "/api/notas", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno_id: Number(formulario.aluno_id),
          ...Object.fromEntries(
            camposDeNota.map(({ nome }) => [nome, Number(formulario[nome])]),
          ),
        }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível salvar as notas.");
      }

      if (editando) {
        roteador.push("/notas");
      } else {
        setFormulario(formularioInicial);
        setMensagem(dados.mensagem || "Notas cadastradas com sucesso!");
      }
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar as notas.");
    } finally {
      setSalvando(false);
    }
  }

  function limparOuCancelar() {
    if (editando) {
      roteador.push("/notas");
      return;
    }
    setFormulario(formularioInicial);
    setMensagem("");
    setErro("");
  }

  return (
    <>
      <Header />
      <main className={estilos.pagina}>
        <section className={estilos.cabecalho} aria-labelledby="titulo-pagina">
          <div>
            <span className={estilos.destaque}>Gestão acadêmica</span>
            <h2 id="titulo-pagina">{editando ? "Editar notas" : "Cadastro de notas"}</h2>
          </div>
          <p>Registre os trabalhos e as avaliações do aluno com valores de 0 a 10.</p>
        </section>

        <section className={estilos.cartaoFormulario} aria-labelledby="titulo-formulario">
          <div className={estilos.cabecalhoFormulario}>
            <div>
              <span>{editando ? "Atualização do boletim" : "Novo lançamento"}</span>
              <h3 id="titulo-formulario">Informações das avaliações</h3>
            </div>
            <span className={estilos.obrigatorio}>Todos os campos são obrigatórios</span>
          </div>

          <form className={estilos.formulario} onSubmit={salvarNotas}>
            <fieldset disabled={carregando || salvando}>
              <div className={estilos.campoAluno}>
                <label htmlFor="aluno_id">Aluno</label>
                <select
                  id="aluno_id"
                  name="aluno_id"
                  value={formulario.aluno_id}
                  onChange={atualizarCampo}
                  required
                >
                  <option value="">{carregando ? "Carregando alunos..." : "Selecione um aluno"}</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id_aluno} value={aluno.id_aluno}>
                      {aluno.nome} — {aluno.serie} (RA: {aluno.ra})
                    </option>
                  ))}
                </select>
              </div>

              <div className={estilos.divisor}>Notas de 0 a 10</div>
              <div className={estilos.gradeNotas}>
                {camposDeNota.map((campo) => (
                  <div className={estilos.campoNota} key={campo.nome}>
                    <label htmlFor={campo.nome}>
                      <strong>{campo.titulo}</strong>
                      <span>{campo.descricao}</span>
                    </label>
                    <input
                      id={campo.nome}
                      name={campo.nome}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formulario[campo.nome]}
                      onChange={atualizarCampo}
                      placeholder="0,0"
                      required
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {!carregando && alunos.length === 0 && !erro && (
              <p className={estilos.aviso} role="status">
                Cadastre um aluno antes de lançar notas. <Link href="/cadalunos">Cadastrar aluno</Link>
              </p>
            )}
            {mensagem && <p className={estilos.sucesso} role="status">{mensagem}</p>}
            {erro && <p className={estilos.erro} role="alert">{erro}</p>}

            <div className={estilos.acoes}>
              <button type="button" className={estilos.botaoSecundario} onClick={limparOuCancelar}>
                {editando ? "Cancelar" : "Limpar"}
              </button>
              <button
                type="submit"
                className={estilos.botaoPrimario}
                disabled={carregando || salvando || alunos.length === 0}
              >
                {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar notas"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
