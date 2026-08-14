"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./home-feed.module.css";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function HomeFeed() {
  const [content, setContent] = useState({ loading: true, events: [], news: [], fetchedAt: 0 });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Falha na API")))
      .then((payload) => setContent({
        loading: false,
        events: payload.events || [],
        news: payload.news || [],
        fetchedAt: Date.now(),
      }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setContent({ loading: false, events: [], news: [], fetchedAt: Date.now() });
        }
      });
    return () => controller.abort();
  }, []);

  const upcoming = content.events
    .filter((event) => event.status === "scheduled" && new Date(event.startsAt).getTime() >= content.fetchedAt)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 2);
  const latestNews = [...content.news]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, 2);

  return (
    <section className={styles.section} aria-labelledby="home-feed-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div><span>Agora no portal</span><h2 id="home-feed-title">Agenda e novidades em um só lugar</h2></div>
          <p>Conteúdo publicado pela equipe responsável aparece aqui automaticamente.</p>
        </div>

        <div className={styles.grid}>
          <article className={styles.panel}>
            <div className={styles.panelTop}><div className={styles.icon}>📅</div><div><span>Próximos compromissos</span><h3>Agenda</h3></div><Link href="/agenda">Ver agenda</Link></div>
            {content.loading ? <div className={styles.skeleton}><i /><i /></div> : upcoming.length ? (
              <div className={styles.feedList}>{upcoming.map((event) => <div className={styles.feedItem} key={event.id}><time>{formatDate(event.startsAt)}</time><strong>{event.title}</strong><p>{event.location || "Local a confirmar"}</p></div>)}</div>
            ) : (
              <div className={styles.empty}><strong>Nenhum evento confirmado</strong><p>A agenda será atualizada assim que a escola confirmar novas datas.</p></div>
            )}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelTop}><div className={styles.icon}>✦</div><div><span>Últimas publicações</span><h3>Notícias</h3></div><Link href="/noticias">Ver notícias</Link></div>
            {content.loading ? <div className={styles.skeleton}><i /><i /></div> : latestNews.length ? (
              <div className={styles.feedList}>{latestNews.map((item) => <Link className={styles.newsItem} href={`/noticias#noticia-${item.id}`} key={item.id}><span>{item.category || "Portal"}</span><strong>{item.title}</strong><p>{item.excerpt || item.summary}</p></Link>)}</div>
            ) : (
              <div className={styles.empty}><strong>Notícias em preparação</strong><p>As novidades verificadas serão publicadas neste espaço.</p></div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
