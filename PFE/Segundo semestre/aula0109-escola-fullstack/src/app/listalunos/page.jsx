'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import styles from "./listalunos.module.css";

export default function ListaAlunos() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function carregarAlunos() {
      try {
        const response = await fetch("/api/alunos", { cache: "no-store", signal: controller.signal });
        const dados = await response.json();
        if (!response.ok) throw new Error(dados.mensagem);
        setStudents(dados);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message || "Erro ao carregar alunos.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    carregarAlunos();
    return () => controller.abort();
  }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredStudents = students.filter((student) =>
    [student.nome, student.serie, student.ra].some((value) =>
      String(value).toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    ),
  );

  async function excluirAlunos(student) {
    if (deleting !== null || !window.confirm(`Excluir ${student.nome}? As notas deste aluno também serão excluídas.`)) return;
    setDeleting(student.id_aluno);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/alunos/${student.id_aluno}`, { method: "DELETE" });
      const dados = await response.json();
      if (!response.ok) throw new Error(dados.mensagem);
      setStudents((current) => current.filter((aluno) => aluno.id_aluno !== student.id_aluno));
      setMessage(dados.mensagem);
    } catch (error) {
      setError(error.message || "Erro ao excluir aluno.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.heading} aria-labelledby="page-title">
          <div>
            <span className={styles.eyebrow}>Gestão acadêmica</span>
            <h2 id="page-title">Lista de alunos</h2>
            <p>Consulte e gerencie os estudantes cadastrados na escola.</p>
          </div>
          <Link href="/alunos" className={styles.addButton}>
            <span aria-hidden="true">+</span> Novo aluno
          </Link>
        </section>

        {loading && <p className={styles.feedback} role="status">Carregando alunos...</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.feedback} role="status">{message}</p>}
        <section className={styles.tableCard} aria-label="Alunos cadastrados">
          <div className={styles.toolbar}>
            <div>
              <strong>{students.length}</strong>
              <span>{students.length === 1 ? "aluno cadastrado" : "alunos cadastrados"}</span>
            </div>
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Buscar aluno</span>
              <span aria-hidden="true">⌕</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, série ou RA" />
            </label>
          </div>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nome</th><th>Idade</th><th>Série</th><th>RA</th><th>Notas</th>
                  <th><span className={styles.srOnly}>Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id_aluno}>
                    <td data-label="ID"><span className={styles.id}>#{String(student.id_aluno).padStart(2, "0")}</span></td>
                    <td data-label="Nome">
                      <div className={styles.studentName}>
                        <span aria-hidden="true">{student.nome.charAt(0)}</span>
                        <strong>{student.nome}</strong>
                      </div>
                    </td>
                    <td data-label="Idade">{student.idade} anos</td>
                    <td data-label="Série"><span className={styles.classTag}>{student.serie}</span></td>
                    <td data-label="RA"><span className={styles.ra}>{student.ra}</span></td>
                    <td data-label="Notas">
                      <div className={styles.grades} aria-label={`Notas de ${student.nome}`}>
                        {student.notas ? Object.entries(student.notas).map(([name, value]) => (
                          <span key={name}><small>{name.toUpperCase()}</small>{value.toFixed(1)}</span>
                        )) : <span>Sem notas</span>}
                      </div>
                    </td>
                    <td className={styles.rowActions}>
                      <Link href={`/alunos?editar=${student.id_aluno}`} className={styles.editButton}>Editar</Link>
                      <button type="button" disabled={deleting !== null} onClick={() => excluirAlunos(student)}>
                        {deleting === student.id_aluno ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && !error && filteredStudents.length === 0 && (
              <div className={styles.emptyState}>
                <span aria-hidden="true">{search ? "⌕" : "—"}</span>
                <h3>{search ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}</h3>
                <p>{search ? "Tente buscar usando outro termo." : "Cadastre um aluno para iniciar a lista."}</p>
                {!search && <Link href="/alunos">Cadastrar aluno</Link>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
