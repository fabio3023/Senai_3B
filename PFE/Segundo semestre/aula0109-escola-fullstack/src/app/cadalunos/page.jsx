'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cabecalho from "@/components/header";
import estilos from "./alunos.module.css";

const formularioInicial = { nome: "", idade: "", serie: "", ra: "" };

export default function CadastroAlunos() {
  return (
    <Suspense fallback={<p role="status">Carregando formulário...</p>}>
      <AlunoSelecionado />
    </Suspense>
  );
}

function AlunoSelecionado() {
  const parametrosBusca = useSearchParams();
  const id = parametrosBusca.get("editar");
  return <FormularioAluno key={id ?? "novo"} id={id} />;
}

function FormularioAluno({ id }) {
  const roteador = useRouter();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(id !== null);
  const [salvando, setSalvando] = useState(false);
  const [carregado, setCarregado] = useState(id === null);

  useEffect(() => {
    if (id === null) return;
    const controlador = new AbortController();

    async function carregarAluno() {
      try {
        if (!/^[1-9]\d*$/.test(id)) throw new Error("ID do aluno inválido.");
        const resposta = await fetch(`/api/alunos/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controlador.signal,
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível carregar o aluno.");

        setFormulario({
          nome: dados.nome,
          idade: String(dados.idade),
          serie: dados.serie,
          ra: dados.ra,
        });
        setCarregado(true);
      } catch (falha) {
        if (!controlador.signal.aborted) {
          setErro(falha.message || "Não foi possível carregar o aluno.");
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarAluno();
    return () => controlador.abort();
  }, [id]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setSalvo(false);
    setErro("");
    setFormulario((dadosAtuais) => ({ ...dadosAtuais, [name]: value }));
  }

  async function salvarAluno(evento) {
    evento.preventDefault();
    if (salvando || !carregado) return;

    setSalvando(true);
    setErro("");
    setSalvo(false);

    try {
      const resposta = await fetch(id !== null
        ? `/api/alunos/${encodeURIComponent(id)}`
        : "/api/alunos", {
        method: id !== null ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formulario, idade: Number(formulario.idade) }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível salvar o aluno.");

      if (id !== null) {
        roteador.push("/listalunos");
      } else {
        setFormulario(formularioInicial);
        setSalvo(true);
      }
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar o aluno.");
    } finally {
      setSalvando(false);
    }
  }

  function limparOuCancelar() {
    if (id !== null) {
      roteador.push("/listalunos");
      return;
    }
    setFormulario(formularioInicial);
    setSalvo(false);
    setErro("");
  }

  return (
    <>
      <Cabecalho />
      <main className={estilos.pagina}>
        <section className={estilos.introducao} aria-labelledby="titulo-pagina">
          <span className={estilos.destaque}>Gestão acadêmica</span>
          <h2 id="titulo-pagina">{id !== null ? "Editar aluno" : "Cadastro de aluno"}</h2>
          <p>
            {id !== null
              ? "Atualize os dados do estudante e salve as alterações."
              : "Inclua um novo estudante na base escolar e mantenha os registros sempre atualizados."}
          </p>

          <div className={estilos.cartaoInformativo}>
            <span className={estilos.iconeInformativo} aria-hidden="true">✓</span>
            <div>
              <strong>Cadastro simples e seguro</strong>
              <p>Todos os campos são necessários para concluir o registro.</p>
            </div>
          </div>

          <div className={estilos.etapas} aria-label="Etapas do cadastro">
            <div className={estilos.etapa}>
              <span>01</span>
              <div><strong>Dados pessoais</strong><small>Nome e idade</small></div>
            </div>
            <div className={estilos.etapa}>
              <span>02</span>
              <div><strong>Dados escolares</strong><small>Série e registro acadêmico</small></div>
            </div>
          </div>
        </section>

        <section className={estilos.cartaoFormulario} aria-labelledby="titulo-formulario">
          <div className={estilos.cabecalhoFormulario}>
            <div>
              <span>Formulário de matrícula</span>
              <h3 id="titulo-formulario">Informações do estudante</h3>
            </div>
            <span className={estilos.obrigatorio}>* Campos obrigatórios</span>
          </div>

          {carregando && <p role="status">Carregando aluno...</p>}
          <form onSubmit={salvarAluno}>
            <fieldset className={estilos.formulario} disabled={carregando || salvando || !carregado}>
              <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                <label htmlFor="nome">Nome completo <span>*</span></label>
                <input id="nome" name="nome" type="text" value={formulario.nome} onChange={atualizarCampo}
                  placeholder="Digite o nome completo" autoComplete="name" required />
              </div>

              <div className={estilos.campo}>
                <label htmlFor="idade">Idade <span>*</span></label>
                <input id="idade" name="idade" type="number" min="1" max="120" value={formulario.idade}
                  onChange={atualizarCampo} placeholder="Ex.: 16" required />
              </div>

              <div className={estilos.campo}>
                <label htmlFor="serie">Série <span>*</span></label>
                <input id="serie" name="serie" type="text" value={formulario.serie}
                  onChange={atualizarCampo} placeholder="Ex.: 3º ano" required />
              </div>

              <div className={`${estilos.campo} ${estilos.larguraTotal}`}>
                <label htmlFor="ra">Registro do aluno (RA) <span>*</span></label>
                <input id="ra" name="ra" type="text" value={formulario.ra} onChange={atualizarCampo}
                  placeholder="Digite o número do registro acadêmico" required />
              </div>

              {salvo && <p className={estilos.sucesso} role="status">Aluno cadastrado com sucesso.</p>}

              <div className={estilos.acoes}>
                <button type="button" className={estilos.botaoSecundario} onClick={limparOuCancelar}>
                  {id !== null ? "Cancelar" : "Limpar"}
                </button>
                <button type="submit" className={estilos.botaoPrimario}>
                  {salvando ? "Salvando..." : id !== null ? "Salvar alterações" : "Salvar cadastro"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </fieldset>
          </form>
          {erro && <p className={estilos.erro} role="alert">{erro}</p>}
        </section>
      </main>
    </>
  );
}
