'use client';

import { useState } from "react";
import Header from "../components/header";
import styles from "./alunos.module.css";

const initialForm = { nome: "", idade: "", serie: "", ra: "" };

export default function CadAlunos() {
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

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.intro} aria-labelledby="page-title">
          <span className={styles.badge}>Gestão acadêmica</span>
          <h2 id="page-title">Cadastro de aluno</h2>
          <p>
            Inclua um novo estudante na base escolar. Preencha os dados ao lado
            com atenção para manter os registros sempre atualizados.
          </p>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">✓</span>
            <div>
              <strong>Cadastro simples e seguro</strong>
              <p>Todos os campos são necessários para concluir o registro.</p>
            </div>
          </div>

          <div className={styles.steps} aria-label="Etapas do cadastro">
            <div className={styles.step}>
              <span>01</span>
              <div><strong>Dados pessoais</strong><small>Nome e idade</small></div>
            </div>
            <div className={styles.step}>
              <span>02</span>
              <div><strong>Dados escolares</strong><small>Série e registro acadêmico</small></div>
            </div>
          </div>
        </section>

        <section className={styles.formCard} aria-labelledby="form-title">
          <div className={styles.formHeader}>
            <div>
              <span>Formulário de matrícula</span>
              <h3 id="form-title">Informações do estudante</h3>
            </div>
            <span className={styles.required}>* Campos obrigatórios</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="nome">Nome completo <span>*</span></label>
              <input id="nome" name="nome" type="text" value={form.nome} onChange={updateField}
                placeholder="Digite o nome completo" autoComplete="name" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="idade">Idade <span>*</span></label>
              <input id="idade" name="idade" type="number" min="1" max="120" value={form.idade}
                onChange={updateField} placeholder="Ex.: 16" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="serie">Série <span>*</span></label>
              <input id="serie" name="serie" type="text" value={form.serie}
                onChange={updateField} placeholder="Ex.: 3º ano" required />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="ra">Registro do aluno (RA) <span>*</span></label>
              <input id="ra" name="ra" type="text" value={form.ra} onChange={updateField}
                placeholder="Digite o número do registro acadêmico" inputMode="numeric" required />
            </div>

            {saved && (
              <p className={styles.success} role="status">
                Dados conferidos com sucesso. O aluno está pronto para ser cadastrado.
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton}
                onClick={() => { setForm(initialForm); setSaved(false); }}>
                Limpar
              </button>
              <button type="submit" className={styles.primaryButton}>
                Salvar cadastro <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
