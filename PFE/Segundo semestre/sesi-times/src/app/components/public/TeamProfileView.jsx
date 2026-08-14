"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TeamActions from "../team-actions";
import PublicHero from "./PublicHero";
import { EmptyState, ErrorState, LoadingState } from "./PublicFeedback";
import {
  formatShortDate,
  isResultEvent,
  matchesTeam,
  slugify,
  usePublicData,
} from "./public-data";
import styles from "./TeamProfileView.module.css";

function TeamMark({ team }) {
  const [failed, setFailed] = useState(false);
  const image = team.crestUrl || team.imageUrl;
  const initials = (team.shortName || team.name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.mark}>
      {image && !failed ? (
        // A origem da imagem foi validada pelo carregador público.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={`Escudo ou imagem do time ${team.name}`} onError={() => setFailed(true)} />
      ) : (
        <span aria-label={`Identificação visual de ${team.name}`}>{initials}</span>
      )}
      <i aria-hidden="true" />
      <i aria-hidden="true" />
    </div>
  );
}

function EventSummary({ event }) {
  const formattedDate = formatShortDate(event.start);
  return (
    <li className={styles.eventItem}>
      <span className={styles.eventDate}>{formattedDate || "Data a confirmar"}</span>
      <div>
        <strong>{event.title}</strong>
        {[event.sport, event.location].filter(Boolean).length ? (
          <small>{[event.sport, event.location].filter(Boolean).join(" · ")}</small>
        ) : null}
      </div>
      {event.result ? <span className={styles.eventResult}>{event.result}</span> : null}
    </li>
  );
}

function NewsSummary({ item }) {
  const body = (
    <>
      <span>{item.category || "Notícia"}</span>
      <strong>{item.title}</strong>
      {formatShortDate(item.publishedAt) ? <time dateTime={item.publishedAt}>{formatShortDate(item.publishedAt)}</time> : null}
    </>
  );
  if (!item.href) return <article className={styles.newsItem}>{body}</article>;
  const external = item.href.startsWith("http://") || item.href.startsWith("https://");
  return external ? (
    <a className={styles.newsItem} href={item.href} target="_blank" rel="noreferrer">{body}</a>
  ) : (
    <Link className={styles.newsItem} href={item.href}>{body}</Link>
  );
}

export default function TeamProfileView({ requestedSlug }) {
  const { data, error, loading, retry } = usePublicData();
  const normalizedSlug = useMemo(() => {
    try {
      return slugify(decodeURIComponent(requestedSlug));
    } catch {
      return slugify(requestedSlug);
    }
  }, [requestedSlug]);
  const team = data?.teams.find((item) => (
    item.slug === normalizedSlug || slugify(item.id) === normalizedSlug || slugify(item.name) === normalizedSlug
  ));
  const relatedEvents = useMemo(
    () => team ? (data?.events || []).filter((event) => matchesTeam(event, team)).slice(0, 4) : [],
    [data?.events, team],
  );
  const relatedNews = useMemo(
    () => team ? (data?.news || []).filter((item) => matchesTeam(item, team)).slice(0, 3) : [],
    [data?.news, team],
  );
  const relatedGallery = useMemo(
    () => team ? (data?.gallery || []).filter((item) => matchesTeam(item, team)).slice(0, 4) : [],
    [data?.gallery, team],
  );

  if (loading) {
    return (
      <main id="conteudo" tabIndex="-1" className={styles.feedbackPage}>
        <LoadingState label="Carregando o perfil do time…" />
      </main>
    );
  }

  if (error) {
    return (
      <main id="conteudo" tabIndex="-1" className={styles.feedbackPage}>
        <ErrorState message={error.message} onRetry={retry} />
      </main>
    );
  }

  if (!team) {
    return (
      <main id="conteudo" tabIndex="-1" className={styles.feedbackPage}>
        <EmptyState
          title="Time não encontrado"
          description="Este endereço não corresponde a um time publicado no portal."
          action={<Link className={styles.backButton} href="/times">Ver todos os times</Link>}
        />
      </main>
    );
  }

  const facts = [
    ["Categoria", team.category],
    ["Modalidade", team.sport],
    ["Temporada", team.season],
    ["Integrantes", team.members],
  ].filter(([, value]) => value);
  const hasRelatedContent = relatedEvents.length || relatedNews.length || relatedGallery.length;

  return (
    <main id="conteudo" tabIndex="-1" className={styles.page}>
      <PublicHero
        eyebrow="Perfil do time"
        title={team.name}
        description={team.description || "Informações públicas desta equipe no SESI Times."}
        icon="team"
      >
        <TeamActions slug={team.slug} name={team.name} />
      </PublicHero>

      <section className={styles.profileSection} aria-labelledby="team-about-title">
        <div className={styles.container}>
          <div className={styles.profileGrid}>
            <TeamMark team={team} />
            <div className={styles.about}>
              <span className={styles.kicker}>{team.status || "Time publicado"}</span>
              <h2 id="team-about-title">{team.nickname || team.name}</h2>
              {team.nickname ? <p className={styles.officialName}>{team.name}</p> : null}
              {team.description ? <p>{team.description}</p> : null}
              {team.motto ? <blockquote>“{team.motto}”</blockquote> : null}
            </div>
          </div>

          {facts.length ? (
            <dl className={styles.facts} aria-label="Informações do time">
              {facts.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <section className={styles.updatesSection} aria-labelledby="team-updates-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Acompanhe a equipe</span>
              <h2 id="team-updates-title">Atualizações vinculadas</h2>
            </div>
          </div>

          {!hasRelatedContent ? (
            <EmptyState
              title="Nenhuma atualização vinculada"
              description="Eventos, notícias e imagens deste time aparecerão aqui quando forem publicados."
            />
          ) : (
            <div className={styles.updatesGrid}>
              {relatedEvents.length ? (
                <section className={`${styles.updateCard} ${styles.eventsCard}`} aria-labelledby="team-events-title">
                  <div className={styles.updateHeader}>
                    <div><span>Agenda</span><h3 id="team-events-title">Eventos e resultados</h3></div>
                    <Link href="/agenda">Ver agenda</Link>
                  </div>
                  <ul>{relatedEvents.map((event) => <EventSummary key={event.id} event={event} />)}</ul>
                  <span className={styles.resultNote}>
                    {relatedEvents.filter(isResultEvent).length} {relatedEvents.filter(isResultEvent).length === 1 ? "resultado vinculado" : "resultados vinculados"}
                  </span>
                </section>
              ) : null}

              {relatedNews.length ? (
                <section className={styles.updateCard} aria-labelledby="team-news-title">
                  <div className={styles.updateHeader}>
                    <div><span>Notícias</span><h3 id="team-news-title">Publicações recentes</h3></div>
                    <Link href="/noticias">Ver notícias</Link>
                  </div>
                  <div className={styles.newsList}>{relatedNews.map((item) => <NewsSummary key={item.id} item={item} />)}</div>
                </section>
              ) : null}

              {relatedGallery.length ? (
                <section className={`${styles.updateCard} ${styles.galleryCard}`} aria-labelledby="team-gallery-title">
                  <div className={styles.updateHeader}>
                    <div><span>Galeria</span><h3 id="team-gallery-title">Registros da equipe</h3></div>
                    <Link href="/galeria">Abrir galeria</Link>
                  </div>
                  <div className={styles.galleryGrid}>
                    {relatedGallery.map((item) => (
                      <Link href="/galeria" key={item.id} aria-label={`Ver ${item.title || item.alt} na galeria`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.alt} loading="lazy" />
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
