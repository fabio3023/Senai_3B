'use client';

import { useState } from "react";
import Header from "../components/header";
import styles from "./cadnotas.module.css";

const initialForm = {
  nomeAluno: "",
  t1: "",
  t2: "",
  n1: "",
  n2: "",
  n3: "",
};

const gradeFields = [
  { name: "t1", label: "T1", description: "Trabalho 1" },
  { name: "t2", label: "T2", description: "Trabalho 2" },
  { name: "n1", label: "N1", description: "Nota 1" },
  { name: "n2", label: "N2", description: "Nota 2" },
  { name: "n3", label: "N3", description: "Nota 3" },
];

export default function CadastroNotas() {
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setSaved(false);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  function clearForm() {
    setForm(initialForm);
    setSaved(false);
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.heading} aria-labelledby="page-title">
          <div>
            <span className={styles.eyebrow}>Gestão de desempenho</span>
            <h2 id="page-title">Cadastro de notas</h2>
          </div>
          <p>Registre as avaliações e os trabalhos do aluno.</p>
        </section>

        <section className={styles.formCard} aria-labelledby="form-title">
          <div className={styles.formHeader}>
            <div>
              <span>Boletim acadêmico</span>
              <h3 id="form-title">Dados da avaliação</h3>
            </div>
            <span className={styles.required}>Todos os campos são obrigatórios</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.studentField}>
              <label htmlFor="nomeAluno">Nome aluno</label>
              <input
                id="nomeAluno"
                name="nomeAluno"
                type="text"
                value={form.nomeAluno}
                onChange={updateField}
                placeholder="Digite o nome completo do aluno"
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.divider} aria-hidden="true">
              <span>Notas e trabalhos</span>
            </div>

            <div className={styles.gradesGrid}>
              {gradeFields.map((field) => (
                <div className={styles.gradeField} key={field.name}>
                  <label htmlFor={field.name}>
                    <strong>{field.label}</strong>
                    <span>{field.description}</span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form[field.name]}
                    onChange={updateField}
                    placeholder="0,0"
                    aria-label={`${field.label} - ${field.description}`}
                    required
                  />
                </div>
              ))}
            </div>

            {saved && (
              <p className={styles.success} role="status">
                Notas salvas com sucesso.
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.clearButton} onClick={clearForm}>
                Limpar
              </button>
              <button type="submit" className={styles.saveButton}>
                Salvar notas <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
