'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/header";
import styles from "./alunos.module.css";

const initialForm = { nome: "", idade: "", serie: "", ra: "" };

export default function CadAlunos() {
  return <Suspense fallback={<p role="status">Carregando formulário...</p>}><AlunoPorId /></Suspense>;
}

function AlunoPorId() {
  const searchParams = useSearchParams();
  const id = searchParams.get("editar");
  return <FormularioAluno key={id ?? "novo"} id={id} />;
}

function FormularioAluno({ id }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(id !== null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(id === null);

  useEffect(() => {
    if (id === null) return;
    const controller = new AbortController();
    async function carregarAluno() {
      try {
        if (!/^[1-9]\d*$/.test(id)) throw new Error("ID do aluno inválido.");
        const response = await fetch(`/api/alunos/${encodeURIComponent(id)}`, {
          cache: "no-store", signal: controller.signal,
        });
        const dados = await response.json();
        if (!response.ok) throw new Error(dados.mensagem);
        setForm({ nome: dados.nome, idade: dados.idade, serie: dados.serie, ra: dados.ra });
        setLoaded(true);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message || "Erro ao carregar aluno.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    carregarAluno();
    return () => controller.abort();
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;
    setSaved(false);
    setError("");
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || !loaded) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(id !== null ? `/api/alunos/${encodeURIComponent(id)}` : "/api/alunos", {
        method: id !== null ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idade: Number(form.idade) }),
      });
      const dados = await response.json();
      if (!response.ok) throw new Error(dados.mensagem);
      if (id !== null) {
        router.push("/listalunos");
      } else {
        setForm(initialForm);
        setSaved(true);
      }
    } catch (error) {
      setError(error.message || "Erro ao salvar aluno.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.intro} aria-labelledby="page-title">
          <span className={styles.badge}>Gestão acadêmica</span>
          <h2 id="page-title">{id !== null ? "Editar aluno" : "Cadastro de aluno"}</h2>
          <p>
            {id !== null
              ? "Atualize os dados do estudante e salve as alterações."
              : "Inclua um novo estudante na base escolar. Preencha os dados ao lado com atenção para manter os registros sempre atualizados."}
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

          {loading && <p role="status">Carregando aluno...</p>}
          <form onSubmit={handleSubmit}>
            <fieldset className={styles.form} disabled={loading || saving || !loaded}>
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
                  Aluno cadastrado com sucesso.
                </p>
              )}

              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton}
                  onClick={() => {
                    if (id !== null) router.push("/listalunos");
                    else { setForm(initialForm); setSaved(false); setError(""); }
                  }}>
                  {id !== null ? "Cancelar" : "Limpar"}
                </button>
                <button type="submit" className={styles.primaryButton}>
                  {saving ? "Salvando..." : id !== null ? "Salvar alterações" : "Salvar cadastro"} <span aria-hidden="true">→</span>
                </button>
              </div>
            </fieldset>
          </form>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </section>
      </main>
    </>
  );
}
