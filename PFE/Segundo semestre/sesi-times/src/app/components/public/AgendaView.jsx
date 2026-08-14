"use client";

import { useMemo, useState } from "react";
import PublicHero from "./PublicHero";
import { EmptyState, ErrorState, LoadingState } from "./PublicFeedback";
import {
  downloadCalendar,
  formatDate,
  isResultEvent,
  parseDate,
  usePublicData,
} from "./public-data";
import styles from "./AgendaView.module.css";

const AGENDA_LOADED_AT = Date.now();
const SCHEDULED_STATUSES = new Set(["agendado", "scheduled"]);

function isUpcomingEvent(event) {
  const status = event.status?.trim().toLocaleLowerCase("pt-BR") || "";
  if (!SCHEDULED_STATUSES.has(status)) return false;

  const date = parseDate(event.start);
  return !date || date.getTime() >= AGENDA_LOADED_AT;
}

function CalendarDownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M12 14v4M9.5 16.5 12 19l2.5-2.5" />
    </svg>
  );
}

function EventCard({ event, resultMode, onDownload }) {
  const formattedDate = formatDate(event.start);
  const canExport = Boolean(parseDate(event.start));
  const detailParts = [event.sport, event.location].filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.cardTopline}>
        <span className={`${styles.status} ${resultMode ? styles.finished : styles.scheduled}`}>
          <i aria-hidden="true" />
          {event.status || (resultMode ? "Resultado" : "Na agenda")}
        </span>
        {event.sport ? <span className={styles.sport}>{event.sport}</span> : null}
      </div>

      <div className={styles.cardBody}>
        <div>
          <h2>{event.title}</h2>
          {formattedDate ? (
            <time dateTime={event.start}>{formattedDate}</time>
          ) : (
            <span className={styles.pendingDate}>Data a confirmar</span>
          )}
          {detailParts.length ? (
            <ul className={styles.details} aria-label="Detalhes do evento">
              {event.location ? (
                <li>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  {event.location}
                </li>
              ) : null}
            </ul>
          ) : null}
          {event.notes ? <p className={styles.notes}>{event.notes}</p> : null}
        </div>

        {resultMode && event.result ? (
          <div className={styles.score} aria-label={`Resultado: ${event.result}`}>
            <span>Placar</span>
            <strong>{event.result}</strong>
          </div>
        ) : null}
      </div>

      {!resultMode && canExport ? (
        <button className={styles.cardDownload} type="button" onClick={() => onDownload(event)}>
          <CalendarDownloadIcon /> Adicionar ao calendário
        </button>
      ) : null}
    </article>
  );
}

export default function AgendaView() {
  const { data, error, loading, retry } = usePublicData();
  const [mode, setMode] = useState("upcoming");
  const [sport, setSport] = useState("all");
  const [calendarMessage, setCalendarMessage] = useState("");

  const events = useMemo(() => data?.events || [], [data?.events]);
  const sports = useMemo(
    () => [...new Set(events.map((event) => event.sport).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [events],
  );
  const visibleEvents = useMemo(() => {
    const resultMode = mode === "results";
    return events
      .filter((event) => resultMode ? isResultEvent(event) : isUpcomingEvent(event))
      .filter((event) => sport === "all" || event.sport === sport)
      .sort((first, second) => {
        const firstTime = parseDate(first.start)?.getTime() ?? Number.POSITIVE_INFINITY;
        const secondTime = parseDate(second.start)?.getTime() ?? Number.POSITIVE_INFINITY;
        return resultMode ? secondTime - firstTime : firstTime - secondTime;
      });
  }, [events, mode, sport]);

  function exportEvents(selectedEvents, filename) {
    const downloaded = downloadCalendar(selectedEvents, filename);
    setCalendarMessage(downloaded
      ? "Arquivo de calendário preparado para download."
      : "Nenhum evento com data válida está disponível para exportação.");
  }

  return (
    <main id="conteudo" tabIndex="-1" className={styles.page}>
      <PublicHero
        eyebrow="Agenda"
        title="Jogos e atividades em um só lugar."
        description="Consulte os compromissos publicados pela escola e acompanhe os resultados já registrados."
        icon="agenda"
      />

      <section className={styles.section} aria-labelledby="agenda-list-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Calendário esportivo</span>
              <h2 id="agenda-list-title">Agenda do SESI Times</h2>
              <p>Os filtros usam somente informações já publicadas no portal.</p>
            </div>
            {!loading && !error && mode === "upcoming" && visibleEvents.length ? (
              <button
                className={styles.downloadAll}
                type="button"
                onClick={() => exportEvents(visibleEvents, "agenda-sesi-times.ics")}
              >
                <CalendarDownloadIcon /> Exportar agenda (.ics)
              </button>
            ) : null}
          </div>

          <p className={styles.liveMessage} aria-live="polite">{calendarMessage}</p>

          {!loading && !error ? (
            <div className={styles.toolbar}>
              <div className={styles.tabs} role="group" aria-label="Tipo de evento">
                <button
                  type="button"
                  aria-pressed={mode === "upcoming"}
                  onClick={() => setMode("upcoming")}
                >
                  Próximos
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "results"}
                  onClick={() => setMode("results")}
                >
                  Resultados
                </button>
              </div>

              {sports.length > 1 ? (
                <label className={styles.selectLabel}>
                  <span>Tipo / modalidade</span>
                  <select value={sport} onChange={(event) => setSport(event.target.value)}>
                    <option value="all">Todas</option>
                    {sports.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ) : null}

              <span className={styles.count} aria-live="polite">
                {visibleEvents.length} {visibleEvents.length === 1 ? "registro" : "registros"}
              </span>
            </div>
          ) : null}

          {loading ? <LoadingState label="Carregando a agenda…" /> : null}
          {error ? <ErrorState message={error.message} onRetry={retry} /> : null}
          {!loading && !error && !visibleEvents.length ? (
            <EmptyState
              title={mode === "results" ? "Nenhum resultado publicado" : "Nenhum próximo evento publicado"}
              description={sport === "all"
                ? "Quando a escola publicar novas informações, elas aparecerão aqui."
                : "Não há registros para a modalidade selecionada. Tente outro filtro."}
            />
          ) : null}
          {!loading && !error && visibleEvents.length ? (
            <div className={styles.grid}>
              {visibleEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  resultMode={mode === "results"}
                  onDownload={(selected) => exportEvents([selected], `evento-${selected.id}.ics`)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
