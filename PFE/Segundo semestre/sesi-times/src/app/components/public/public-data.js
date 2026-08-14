"use client";

import { useCallback, useEffect, useState } from "react";

let publicDataCache = null;
let publicDataRequest = null;

const RESULT_STATUSES = new Set([
  "completed",
  "concluded",
  "ended",
  "finished",
  "finalizado",
  "encerrado",
  "concluido",
  "concluído",
  "resultado",
]);

const STATUS_LABELS = {
  active: "Ativo",
  inactive: "Inativo",
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  canceled: "Cancelado",
};

const EVENT_KIND_LABELS = {
  game: "Jogo",
  training: "Treino",
  activity: "Atividade",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function labelFor(value, labels) {
  const text = asText(value);
  return labels[text.toLowerCase()] || text;
}

function pick(record, ...keys) {
  if (!record || typeof record !== "object") return "";

  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return "";
}

export function slugify(value) {
  return asText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeUrl(value) {
  const candidate = asText(value);
  if (!candidate) return null;

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function referenceValues(reference) {
  if (Array.isArray(reference)) return reference.flatMap(referenceValues);
  if (typeof reference === "string" || typeof reference === "number") {
    return [asText(reference)];
  }
  if (!reference || typeof reference !== "object") return [];

  return [
    pick(reference, "id", "uuid"),
    pick(reference, "slug", "code", "codigo"),
    pick(reference, "name", "nome", "title", "teamName", "nomeTime"),
  ].map(asText).filter(Boolean);
}

function collectTeamKeys(record) {
  const references = [
    pick(record, "team", "time", "teamId", "timeId", "teamSlug", "timeSlug"),
    pick(record, "homeTeam", "mandante", "home"),
    pick(record, "awayTeam", "visitante", "away", "opponent", "adversario"),
    pick(record, "teams", "times"),
  ];

  return [...new Set(references.flatMap(referenceValues).flatMap((value) => {
    const slug = slugify(value);
    return slug && slug !== value.toLowerCase() ? [value.toLowerCase(), slug] : [value.toLowerCase()];
  }))];
}

function displayReference(reference) {
  if (typeof reference === "string" || typeof reference === "number") {
    return asText(reference);
  }
  return asText(pick(reference, "name", "nome", "title", "shortName", "apelido"));
}

function normalizeResult(value) {
  if (typeof value === "string" || typeof value === "number") return asText(value);
  if (!value || typeof value !== "object") return "";

  const label = asText(pick(value, "label", "text", "placar", "score"));
  if (label) return label;

  const home = pick(value, "home", "homeScore", "mandante", "pontosMandante");
  const away = pick(value, "away", "awayScore", "visitante", "pontosVisitante");
  if (home !== "" && away !== "") return `${asText(home)} × ${asText(away)}`;
  return "";
}

function normalizeTeam(team, index) {
  if (!team || typeof team !== "object") return null;

  const name = asText(pick(team, "name", "nome", "title", "teamName", "nomeTime"));
  const suppliedSlug = asText(pick(team, "slug", "code", "codigo"));
  const id = asText(pick(team, "id", "uuid"));
  const slug = slugify(suppliedSlug || name || id);
  if (!slug || !name) return null;

  return {
    id: id || slug || `team-${index}`,
    slug,
    name,
    shortName: asText(pick(team, "shortName", "nomeCurto", "abbreviation", "sigla")),
    nickname: asText(pick(team, "nickname", "apelido")),
    description: asText(pick(team, "description", "descricao", "about", "sobre")),
    motto: asText(pick(team, "motto", "lema")),
    category: asText(pick(team, "category", "categoria", "level", "nivel")),
    sport: asText(pick(team, "sport", "modality", "modalidade")),
    season: asText(pick(team, "season", "temporada", "year", "ano")),
    status: labelFor(pick(team, "status", "situacao"), STATUS_LABELS),
    members: asText(pick(team, "members", "memberCount", "integrantes", "quantidadeIntegrantes")),
    imageUrl: safeUrl(pick(team, "imageUrl", "image", "imagem", "coverUrl", "capa")),
    crestUrl: safeUrl(pick(team, "crestUrl", "logoUrl", "logo", "escudo")),
    raw: team,
  };
}

function normalizeEvent(event, index) {
  if (!event || typeof event !== "object") return null;

  const home = displayReference(pick(event, "homeTeam", "mandante", "home"));
  const away = displayReference(pick(event, "awayTeam", "visitante", "away", "opponent", "adversario"));
  const suppliedTitle = asText(pick(event, "title", "name", "nome"));
  const title = suppliedTitle || [home, away].filter(Boolean).join(" × ") || "Evento sem título";
  const id = asText(pick(event, "id", "uuid", "slug")) || `event-${index}`;

  return {
    id,
    title,
    start: asText(pick(event, "startsAt", "startAt", "start", "date", "data", "dataInicio")),
    end: asText(pick(event, "endsAt", "endAt", "end", "dataFim")),
    location: asText(pick(event, "location", "local", "venue")),
    sport: labelFor(pick(event, "sport", "modality", "modalidade", "category", "categoria", "kind", "tipo"), EVENT_KIND_LABELS),
    status: labelFor(pick(event, "status", "situacao"), STATUS_LABELS),
    result: normalizeResult(pick(event, "result", "resultado", "score", "placar")),
    notes: asText(pick(event, "notes", "observations", "observacoes", "descricao", "description")),
    homeTeam: home,
    awayTeam: away,
    teamKeys: collectTeamKeys(event),
    raw: event,
  };
}

function normalizeNews(item, index) {
  if (!item || typeof item !== "object") return null;

  const title = asText(pick(item, "title", "titulo", "name", "nome"));
  if (!title) return null;

  return {
    id: asText(pick(item, "id", "uuid", "slug")) || `news-${index}`,
    title,
    excerpt: asText(pick(item, "excerpt", "resumo", "summary", "description", "descricao")),
    content: asText(pick(item, "content", "conteudo", "body", "texto")),
    category: asText(pick(item, "category", "categoria", "tag")),
    author: asText(pick(item, "author", "autor")),
    publishedAt: asText(pick(item, "publishedAt", "date", "data", "createdAt")),
    imageUrl: safeUrl(pick(item, "imageUrl", "image", "imagem", "coverUrl", "capa")),
    href: safeUrl(pick(item, "href", "url", "link", "sourceUrl")),
    teamKeys: collectTeamKeys(item),
    raw: item,
  };
}

function normalizeGalleryItem(item, index) {
  if (!item || typeof item !== "object") return null;

  const imageUrl = safeUrl(pick(item, "imageUrl", "image", "imagem", "src", "url"));
  if (!imageUrl) return null;

  const title = asText(pick(item, "title", "titulo", "name", "nome"));
  const caption = asText(pick(item, "caption", "legenda", "description", "descricao"));

  return {
    id: asText(pick(item, "id", "uuid")) || `gallery-${index}`,
    imageUrl,
    title,
    caption,
    alt: asText(pick(item, "alt", "alternativeText", "textoAlternativo")) || title || caption || "Imagem da galeria",
    date: asText(pick(item, "date", "data", "createdAt", "publishedAt")),
    credit: asText(pick(item, "credit", "credito", "author", "autor")),
    teamKeys: collectTeamKeys(item),
    raw: item,
  };
}

function normalizePayload(payload) {
  const source = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("A resposta pública do portal está em um formato inválido.");
  }

  return {
    teams: asArray(source.teams).map(normalizeTeam).filter(Boolean),
    events: asArray(source.events).map(normalizeEvent).filter(Boolean),
    news: asArray(source.news).map(normalizeNews).filter(Boolean),
    gallery: asArray(source.gallery).map(normalizeGalleryItem).filter(Boolean),
  };
}

async function requestPublicData(force = false) {
  if (!force && publicDataRequest) return publicDataRequest;

  publicDataRequest = fetch("/api/public", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Não foi possível consultar o portal (${response.status}).`);
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error("O portal recebeu uma resposta que não pôde ser lida.");
      }

      publicDataCache = normalizePayload(payload);
      return publicDataCache;
    })
    .finally(() => {
      publicDataRequest = null;
    });

  return publicDataRequest;
}

export function usePublicData() {
  const [state, setState] = useState(() => ({
    data: publicDataCache,
    error: null,
    loading: !publicDataCache,
  }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    requestPublicData(attempt > 0)
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (active) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error("Não foi possível carregar os dados."),
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    publicDataCache = null;
    publicDataRequest = null;
    setState({ data: null, error: null, loading: true });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return null;

  const hasExplicitTime = typeof value === "string" && /T\d{2}:\d{2}/.test(value);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(hasExplicitTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    ...options,
  }).format(date);
}

export function formatShortDate(value) {
  return formatDate(value, { day: "2-digit", month: "short", year: "numeric" });
}

export function isResultEvent(event) {
  return Boolean(event?.result) || RESULT_STATUSES.has(asText(event?.status).toLowerCase());
}

export function matchesTeam(item, team) {
  if (!item || !team) return false;
  const candidates = [team.id, team.slug, team.name, team.shortName, team.nickname]
    .flatMap((value) => [asText(value).toLowerCase(), slugify(value)])
    .filter(Boolean);
  return candidates.some((candidate) => item.teamKeys?.includes(candidate));
}

function escapeIcs(value) {
  return asText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { key: "DTSTART;VALUE=DATE", value: value.replace(/-/g, "") };
  }

  const date = parseDate(value);
  if (!date) return null;
  return {
    key: "DTSTART",
    value: date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"),
  };
}

function eventToIcs(event) {
  const start = formatIcsDate(event.start);
  if (!start) return null;

  const end = event.end ? formatIcsDate(event.end) : null;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.id)}@sesi-times.local`,
    `DTSTAMP:${stamp}`,
    `${start.key}:${start.value}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ];

  if (end) lines.push(`${end.key.replace("DTSTART", "DTEND")}:${end.value}`);
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
  if (event.notes) lines.push(`DESCRIPTION:${escapeIcs(event.notes)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function downloadCalendar(events, filename = "agenda-sesi-times.ics") {
  if (typeof document === "undefined") return false;
  const entries = events.map(eventToIcs).filter(Boolean);
  if (!entries.length) return false;

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SESI Times//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    ...entries,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}
