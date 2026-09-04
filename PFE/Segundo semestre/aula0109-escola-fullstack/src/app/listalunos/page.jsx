'use client';

import { useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import styles from "./listalunos.module.css";

const initialStudents = [
  {
    id: 1,
    nome: "Ana Luisa",
    idade: 17,
    serie: "3º B",
    ra: "909030",
    notas: { t1: 8.5, t2: 9, n1: 8, n2: 9.2, n3: 8.8 },
  },
  {
    id: 2,
    nome: "João Pedro",
    idade: 16,
    serie: "2º A",
    ra: "909031",
    notas: { t1: 7.5, t2: 8, n1: 7.8, n2: 8.5, n3: 9 },
  },
  {
    id: 3,
    nome: "Maria Eduarda",
    idade: 17,
    serie: "3º A",
    ra: "909032",
    notas: { t1: 9.5, t2: 9, n1: 8.7, n2: 9.4, n3: 9.2 },
  },
];

export default function ListaAlunos() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredStudents = students.filter((student) =>
    [student.nome, student.serie, student.ra].some((value) =>
      String(value).toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    ),
  );

  function removeStudent(id) {
    setStudents((current) => current.filter((student) => student.id !== id));
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
                  <tr key={student.id}>
                    <td data-label="ID"><span className={styles.id}>#{String(student.id).padStart(2, "0")}</span></td>
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
                        {Object.entries(student.notas).map(([name, value]) => (
                          <span key={name}><small>{name.toUpperCase()}</small>{value.toFixed(1)}</span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.rowActions}>
                      <Link href={`/alunos?editar=${student.id}`} className={styles.editButton}>Editar</Link>
                      <button type="button" onClick={() => removeStudent(student.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
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
