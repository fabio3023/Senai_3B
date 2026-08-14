"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PublicHero from "./PublicHero";
import { EmptyState, ErrorState, LoadingState } from "./PublicFeedback";
import { formatShortDate, usePublicData } from "./public-data";
import styles from "./NewsView.module.css";

function normalizeSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function NewsArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function NewsCard({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  const publishedDate = formatShortDate(item.publishedAt);
  const summary = item.excerpt;
  const content = item.content?.trim();
  const hasAdditionalContent = Boolean(content && summary && content !== summary.trim());
  const isExternal = item.href?.startsWith("http://") || item.href?.startsWith("https://");
  const action = item.href ? (
    isExternal ? (
      <a className={styles.cardAction} href={item.href} target="_blank" rel="noreferrer">
        Ler notícia <span className={styles.externalHint}>(abre em nova aba)</span> <NewsArrow />
      </a>
    ) : (
      <Link className={styles.cardAction} href={item.href}>
        Ler notícia <NewsArrow />
      </Link>
    )
  ) : null;

  return (
    <article className={styles.card} id={`noticia-${item.id}`} tabIndex="-1">
      <div className={styles.visual}>
        {item.imageUrl && !imageFailed ? (
          // A API pode servir imagens locais ou remotas já validadas pelo cliente.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" />
              <path d="M9 8h6M9 12h6M9 16h3M5 18H3V7h2" />
            </svg>
          </span>
        )}
        {item.category ? <span className={styles.category}>{item.category}</span> : null}
      </div>

      <div className={styles.body}>
        {(publishedDate || item.author) ? (
          <div className={styles.meta}>
            {publishedDate ? <time dateTime={item.publishedAt}>{publishedDate}</time> : null}
            {publishedDate && item.author ? <i aria-hidden="true" /> : null}
            {item.author ? <span>{item.author}</span> : null}
          </div>
        ) : null}
        <h2>{item.title}</h2>
        {summary ? (
          <p className={content && !hasAdditionalContent ? styles.completeSummary : undefined}>{summary}</p>
        ) : null}
        {hasAdditionalContent ? (
          <details className={styles.fullStory}>
            <summary>Ler conteúdo completo</summary>
            <p>{content}</p>
          </details>
        ) : !summary && content ? (
          <div className={styles.fullStoryText}><p>{content}</p></div>
        ) : null}
        {action}
      </div>
    </article>
  );
}

export default function NewsView() {
  const { data, error, loading, retry } = usePublicData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const news = useMemo(() => data?.news || [], [data?.news]);
  const categories = useMemo(
    () => [...new Set(news.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [news],
  );
  const visibleNews = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    return news.filter((item) => {
      const categoryMatches = category === "all" || item.category === category;
      const searchable = normalizeSearch([item.title, item.excerpt, item.content, item.author, item.category].filter(Boolean).join(" "));
      return categoryMatches && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, news, query]);

  const hasFilters = Boolean(query.trim()) || category !== "all";

  useEffect(() => {
    if (loading || error || !window.location.hash) return undefined;

    let targetId;
    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return undefined;
    }

    if (!targetId.startsWith("noticia-")) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [error, loading]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <main id="conteudo" tabIndex="-1" className={styles.page}>
      <PublicHero
        eyebrow="Notícias"
        title="Histórias que movimentam a escola."
        description="Acompanhe comunicados, conquistas e novidades publicados pela comunidade do SESI Times."
        icon="news"
      />

      <section className={styles.section} aria-labelledby="news-list-title">
        <div className={styles.container}>
          <div className={styles.heading}>
            <div>
              <span className={styles.kicker}>Últimas publicações</span>
              <h2 id="news-list-title">Notícias do portal</h2>
            </div>
            {!loading && !error && news.length ? (
              <span className={styles.total}>{news.length} {news.length === 1 ? "publicação" : "publicações"}</span>
            ) : null}
          </div>

          {!loading && !error && news.length ? (
            <div className={styles.filters} role="search">
              <label className={styles.search}>
                <span className={styles.srOnly}>Buscar notícias</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título ou assunto"
                />
              </label>
              {categories.length ? (
                <label className={styles.categoryFilter}>
                  <span>Categoria</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="all">Todas</option>
                    {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ) : null}
              <span className={styles.resultCount} aria-live="polite">
                {visibleNews.length} {visibleNews.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>
          ) : null}

          {loading ? <LoadingState label="Carregando as notícias…" /> : null}
          {error ? <ErrorState message={error.message} onRetry={retry} /> : null}
          {!loading && !error && !visibleNews.length ? (
            <EmptyState
              title={hasFilters ? "Nenhuma notícia encontrada" : "Nenhuma notícia publicada"}
              description={hasFilters
                ? "Altere os termos da busca ou limpe os filtros para ver todas as publicações."
                : "As novas publicações aparecerão aqui assim que forem disponibilizadas no portal."}
              action={hasFilters ? (
                <button className={styles.clearButton} type="button" onClick={clearFilters}>Limpar filtros</button>
              ) : null}
            />
          ) : null}
          {!loading && !error && visibleNews.length ? (
            <div className={styles.grid}>
              {visibleNews.map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
