'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import estilos from "./notas.module.css";

const nomesDasNotas = ["t1", "t2", "n1", "n2", "n3"];

function calcularMedia(nota) {
  const total = nomesDasNotas.reduce((soma, campo) => soma + Number(nota[campo]), 0);
  return total / nomesDasNotas.length;
}

export default function ListaNotas() {
  const [notas, setNotas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [idEmExclusao, setIdEmExclusao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarNotas() {
      try {
        const resposta = await fetch("/api/notas", {
          cache: "no-store",
          signal: controlador.signal,
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
          throw new Error(dados.mensagem || "Não foi possível carregar as notas.");
        }
        setNotas(dados);
      } catch (falha) {
        if (!controlador.signal.aborted) {
          setErro(falha.message || "Não foi possível carregar as notas.");
        }
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarNotas();
    return () => controlador.abort();
  }, []);

  const notasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return notas;
    return notas.filter((nota) =>
      [nota.nome, nota.ra, nota.serie].some((valor) =>
        String(valor).toLocaleLowerCase("pt-BR").includes(termo),
      ),
    );
  }, [busca, notas]);

  async function excluirNotas(nota) {
    const confirmou = window.confirm(`Deseja excluir as notas de ${nota.nome}?`);
    if (!confirmou || idEmExclusao !== null) return;

    setIdEmExclusao(nota.id_notas);
    setMensagem("");
    setErro("");

    try {
      const resposta = await fetch(`/api/notas/${nota.id_notas}`, { method: "DELETE" });
      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível excluir as notas.");
      }
      setNotas((listaAtual) =>
        listaAtual.filter((item) => item.id_notas !== nota.id_notas),
      );
      setMensagem(dados.mensagem || "Notas excluídas com sucesso!");
    } catch (falha) {
      setErro(falha.message || "Não foi possível excluir as notas.");
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
            <span className={estilos.destaque}>Desempenho escolar</span>
            <h2 id="titulo-pagina">Boletins e notas</h2>
            <p>Consulte, edite e exclua os lançamentos registrados.</p>
          </div>
          <Link href="/cadnotas" className={estilos.botaoNovo}>
            <span aria-hidden="true">+</span> Lançar notas
          </Link>
        </section>

        {erro && <p className={estilos.erro} role="alert">{erro}</p>}
        {mensagem && <p className={estilos.sucesso} role="status">{mensagem}</p>}

        <section className={estilos.cartaoTabela} aria-label="Notas cadastradas">
          <div className={estilos.barraFerramentas}>
            <div className={estilos.quantidade}>
              <strong>{notas.length}</strong>
              <span>{notas.length === 1 ? "boletim cadastrado" : "boletins cadastrados"}</span>
            </div>
            <label className={estilos.campoBusca}>
              <span className={estilos.somenteLeitor}>Buscar boletim</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por aluno, série ou RA"
              />
            </label>
          </div>

          <div className={estilos.areaTabela}>
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  {nomesDasNotas.map((nome) => <th key={nome}>{nome.toUpperCase()}</th>)}
                  <th>Média</th>
                  <th><span className={estilos.somenteLeitor}>Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {notasFiltradas.map((nota) => {
                  const media = calcularMedia(nota);
                  return (
                    <tr key={nota.id_notas}>
                      <td data-label="Aluno">
                        <div className={estilos.aluno}>
                          <span aria-hidden="true">{nota.nome.charAt(0).toUpperCase()}</span>
                          <div><strong>{nota.nome}</strong><small>RA {nota.ra}</small></div>
                        </div>
                      </td>
                      <td data-label="Turma"><span className={estilos.serie}>{nota.serie}</span></td>
                      {nomesDasNotas.map((nome) => (
                        <td data-label={nome.toUpperCase()} key={nome}>{Number(nota[nome]).toFixed(1)}</td>
                      ))}
                      <td data-label="Média">
                        <span className={media >= 6 ? estilos.mediaAprovada : estilos.mediaBaixa}>
                          {media.toFixed(1)}
                        </span>
                      </td>
                      <td className={estilos.acoes}>
                        <Link href={`/cadnotas?editar=${nota.id_notas}`} className={estilos.botaoEditar}>
                          Editar
                        </Link>
                        <button
                          type="button"
                          className={estilos.botaoExcluir}
                          disabled={idEmExclusao !== null}
                          onClick={() => excluirNotas(nota)}
                        >
                          {idEmExclusao === nota.id_notas ? "Excluindo..." : "Excluir"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {carregando && <div className={estilos.estadoVazio} role="status"><h3>Carregando notas...</h3></div>}
            {!carregando && !erro && notasFiltradas.length === 0 && (
              <div className={estilos.estadoVazio}>
                <span aria-hidden="true">{busca ? "⌕" : "—"}</span>
                <h3>{busca ? "Nenhum boletim encontrado" : "Nenhuma nota cadastrada"}</h3>
                <p>{busca ? "Tente buscar usando outro termo." : "Faça o primeiro lançamento de notas."}</p>
                {!busca && <Link href="/cadnotas">Lançar notas</Link>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
