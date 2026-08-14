"use client";

import { useState } from "react";
import styles from "../../participar/participar.module.css";

const DEFAULT_SEASON = new Date().getFullYear();

export default function ParticipationForm() {
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const submitRequest = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    if (form.get("website")) return;

    setStatus({ type: "loading", message: "Enviando solicitação..." });

    try {
      const season = form.get("season");
      const response = await fetch("/api/team-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: form.get("teamName"),
          nickname: form.get("nickname"),
          category: form.get("category"),
          ...(season ? { season } : {}),
          requesterName: form.get("contactName"),
          requesterEmail: form.get("contactEmail"),
          description: form.get("message"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.error?.details?.message ||
          result.error?.message ||
          (typeof result.error === "string" ? result.error : "") ||
          "Não foi possível enviar a solicitação.",
        );
      }

      formElement.reset();
      setStatus({
        type: "success",
        message: result.message || "Solicitação enviada! A equipe responsável fará a análise.",
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <div className={styles.formCard}>
      <span className={styles.formEyebrow}>Solicitar cadastro</span>
      <h2>Conte um pouco sobre o time</h2>
      <p>Os campos marcados são necessários para a análise.</p>

      <form onSubmit={submitRequest}>
        <div className={styles.fieldGrid}>
          <label>Nome do time *<input name="teamName" required maxLength={80} /></label>
          <label>Apelido<input name="nickname" maxLength={60} /></label>
          <label>Categoria ou turma *<input name="category" required maxLength={60} placeholder="Ex.: 2º Médio A" /></label>
          <label>Temporada *<input name="season" type="number" required min="2000" max="2100" defaultValue={DEFAULT_SEASON} /></label>
          <label>Nome do responsável *<input name="contactName" required maxLength={80} /></label>
        </div>
        <label>E-mail para contato *<input name="contactEmail" type="email" required maxLength={120} /></label>
        <label>Mensagem<textarea name="message" maxLength={800} rows={5} placeholder="Modalidade, objetivo e outras informações importantes..." /></label>
        <label className={styles.consent}>
          <input name="consent" type="checkbox" required />
          <span>Confirmo que os dados são verdadeiros e poderão ser usados para analisar esta solicitação.</span>
        </label>
        <label className={styles.honeypot} aria-hidden="true">
          Não preencha este campo<input name="website" tabIndex="-1" autoComplete="off" />
        </label>
        <button type="submit" disabled={status.type === "loading"}>
          {status.type === "loading" ? "Enviando..." : "Enviar para análise"}
        </button>
      </form>
      <p className={styles.statusMessage} data-type={status.type} aria-live="polite">{status.message}</p>
      <small>O envio não publica o time automaticamente.</small>
    </div>
  );
}
