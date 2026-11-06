'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import estilos from "./listalunos.module.css";

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [idEmExclusao, setIdEmExclusao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarAlunos() {
      try {
        const resposta = await fetch("/api/alunos", {
          cache: "no-store",
          signal: controlador.signal,
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.mensagem || "Não foi possível carregar os alunos.");
        }

        setAlunos(dados);
      } catch (falha) {
        if (!controlador.signal.aborted) {
          setErro(falha.message || "Não foi possível carregar os alunos.");
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarAlunos();
    return () => controlador.abort();
  }, []);

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return alunos;

    return alunos.filter((aluno) =>
      [aluno.nome, aluno.idade, aluno.serie, aluno.ra].some((valor) =>
        String(valor).toLocaleLowerCase("pt-BR").includes(termo),
      ),
    );
  }, [alunos, busca]);

  async function excluirAluno(aluno) {
    const confirmou = window.confirm(`Deseja realmente excluir ${aluno.nome}?`);
    if (!confirmou || idEmExclusao !== null) return;

    setIdEmExclusao(aluno.id_aluno);
    setMensagem("");
    setErro("");

    try {
      const resposta = await fetch(`/api/alunos/${aluno.id_aluno}`, {
        method: "DELETE",
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível excluir o aluno.");
      }

      setAlunos((listaAtual) =>
        listaAtual.filter((item) => item.id_aluno !== aluno.id_aluno),
      );
      setMensagem(dados.mensagem || "Aluno excluído com sucesso!");
    } catch (falha) {
      setErro(falha.message || "Não foi possível excluir o aluno.");
    } finally {
      setIdEmExclusao(null);
    }
  }

  return (
    <>
      <Header />

      <main className={estilos.pagina}>
        <section className={estilos.cabecalho} aria-labelledby="titulo-pagina">
          <div>
            <span className={estilos.destaque}>Gestão acadêmica</span>
            <h2 id="titulo-pagina">Lista de alunos</h2>
            <p>Consulte e gerencie todos os alunos cadastrados no sistema.</p>
          </div>

          <Link href="/cadalunos" className={estilos.botaoNovo}>
            <span aria-hidden="true">+</span>
            Novo aluno
          </Link>
        </section>

        {erro && <p className={estilos.erro} role="alert">{erro}</p>}
        {mensagem && <p className={estilos.sucesso} role="status">{mensagem}</p>}

        <section className={estilos.cartaoTabela} aria-label="Alunos cadastrados">
          <div className={estilos.barraFerramentas}>
            <div className={estilos.quantidade}>
              <strong>{alunos.length}</strong>
              <span>{alunos.length === 1 ? "aluno cadastrado" : "alunos cadastrados"}</span>
            </div>

            <label className={estilos.campoBusca}>
              <span className={estilos.somenteLeitor}>Buscar aluno</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por nome, série ou RA"
              />
            </label>
          </div>

          <div className={estilos.areaTabela}>
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>Série</th>
                  <th>RA</th>
                  <th><span className={estilos.somenteLeitor}>Ações</span></th>
                </tr>
              </thead>

              <tbody>
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id_aluno}>
                    <td data-label="ID">
                      <span className={estilos.identificador}>
                        #{String(aluno.id_aluno).padStart(2, "0")}
                      </span>
                    </td>
                    <td data-label="Nome">
                      <div className={estilos.nomeAluno}>
                        <span aria-hidden="true">{aluno.nome.charAt(0).toUpperCase()}</span>
                        <strong>{aluno.nome}</strong>
                      </div>
                    </td>
                    <td data-label="Idade">{aluno.idade} anos</td>
                    <td data-label="Série"><span className={estilos.serie}>{aluno.serie}</span></td>
                    <td data-label="RA"><span className={estilos.ra}>{aluno.ra}</span></td>
                    <td className={estilos.acoes}>
                      <Link
                        href={`/cadalunos?editar=${aluno.id_aluno}`}
                        className={estilos.botaoEditar}
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className={estilos.botaoExcluir}
                        disabled={idEmExclusao !== null}
                        onClick={() => excluirAluno(aluno)}
                      >
                        {idEmExclusao === aluno.id_aluno ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {carregando && (
              <div className={estilos.estadoVazio} role="status">
                <span className={estilos.carregador} aria-hidden="true" />
                <h3>Carregando alunos...</h3>
              </div>
            )}

            {!carregando && !erro && alunosFiltrados.length === 0 && (
              <div className={estilos.estadoVazio}>
                <span aria-hidden="true">{busca ? "⌕" : "—"}</span>
                <h3>{busca ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}</h3>
                <p>
                  {busca
                    ? "Tente fazer a busca usando outro termo."
                    : "Cadastre o primeiro aluno para começar."}
                </p>
                {!busca && <Link href="/cadalunos">Cadastrar aluno</Link>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
