"use client";

import Link from "next/link";

export default function ErrorPage({ reset }) {
  return (
    <main id="conteudo" className="feedback-page" tabIndex="-1">
      <div className="feedback-card">
        <span className="feedback-code">Ops!</span>
        <p className="eyebrow eyebrow-dark">Erro inesperado</p>
        <h1>Não conseguimos carregar esta jogada.</h1>
        <p>Tente novamente. Se o problema continuar, volte para a página inicial.</p>
        <div className="feedback-actions">
          <button className="button button-primary" type="button" onClick={() => reset()}>
            Tentar novamente
          </button>
          <Link className="button button-secondary" href="/">Voltar ao início</Link>
        </div>
      </div>
    </main>
  );
}
