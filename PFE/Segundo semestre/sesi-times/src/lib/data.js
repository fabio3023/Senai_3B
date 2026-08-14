import { getDatabase } from "@/lib/db";
import {
  assertAllowedKeys,
  assertPlainObject,
  boolean,
  dateTime,
  email,
  integer,
  makeSlug,
  oneOf,
  optionalDateTime,
  optionalInteger,
  optionalString,
  requiredString,
  slug,
  ValidationError,
  webUrl,
} from "@/lib/validation";

export const CONTENT_TYPES = ["teams", "events", "news", "gallery"];

function asIsoDate(value) {
  if (!value) {
    return null;
  }

  const normalized = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const timestamp = Date.parse(normalized);

  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function teamFromRow(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    nickname: row.nickname,
    category: row.category,
    season: Number(row.season),
    description: row.description,
    active: Boolean(row.active),
    status: row.active ? "active" : "inactive",
    createdAt: asIsoDate(row.created_at),
    updatedAt: asIsoDate(row.updated_at),
  };
}

function eventFromRow(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    teamId: Number(row.team_id),
    teamSlug: row.team_slug,
    teamName: row.team_name,
    title: row.title,
    description: row.description,
    kind: row.kind,
    startsAt: asIsoDate(row.starts_at),
    endsAt: asIsoDate(row.ends_at),
    location: row.location,
    status: row.status,
    result: row.result,
    published: Boolean(row.published),
    createdAt: asIsoDate(row.created_at),
    updatedAt: asIsoDate(row.updated_at),
  };
}

function newsFromRow(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    teamId: row.team_id === null ? null : Number(row.team_id),
    teamSlug: row.team_slug,
    teamName: row.team_name,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    publishedAt: asIsoDate(row.published_at),
    published: Boolean(row.published),
    createdAt: asIsoDate(row.created_at),
    updatedAt: asIsoDate(row.updated_at),
  };
}

function galleryFromRow(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    teamId: row.team_id === null ? null : Number(row.team_id),
    teamSlug: row.team_slug,
    teamName: row.team_name,
    title: row.title,
    imageUrl: row.image_url,
    altText: row.alt_text,
    alt: row.alt_text,
    caption: row.caption,
    published: Boolean(row.published),
    createdAt: asIsoDate(row.created_at),
    updatedAt: asIsoDate(row.updated_at),
  };
}

function teamRequestFromRow(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    teamName: row.team_name,
    nickname: row.nickname,
    category: row.category,
    season: Number(row.season),
    description: row.description,
    status: row.status,
    createdAt: asIsoDate(row.created_at),
    updatedAt: asIsoDate(row.updated_at),
  };
}

const joinedEventSelect = `
  SELECT e.*, t.slug AS team_slug, t.name AS team_name
  FROM events e
  JOIN teams t ON t.id = e.team_id
`;

const joinedNewsSelect = `
  SELECT n.*, t.slug AS team_slug, t.name AS team_name
  FROM news n
  LEFT JOIN teams t ON t.id = n.team_id
`;

const joinedGallerySelect = `
  SELECT g.*, t.slug AS team_slug, t.name AS team_name
  FROM gallery g
  LEFT JOIN teams t ON t.id = g.team_id
`;

export function getPublicContent(teamFilter = null) {
  const database = getDatabase();
  let selectedTeam = null;

  if (teamFilter) {
    selectedTeam = /^\d+$/.test(teamFilter)
      ? database.prepare("SELECT * FROM teams WHERE id = ? AND active = 1").get(Number(teamFilter))
      : database.prepare("SELECT * FROM teams WHERE slug = ? AND active = 1").get(teamFilter);

    if (!selectedTeam) {
      return null;
    }
  }

  const teams = selectedTeam
    ? [teamFromRow(selectedTeam)]
    : database.prepare("SELECT * FROM teams WHERE active = 1 ORDER BY season DESC, name ASC")
      .all().map(teamFromRow);

  const events = selectedTeam
    ? database.prepare(`${joinedEventSelect}
        WHERE e.published = 1 AND t.active = 1 AND e.team_id = ?
        ORDER BY e.starts_at ASC, e.id ASC`)
      .all(selectedTeam.id).map(eventFromRow)
    : database.prepare(`${joinedEventSelect}
        WHERE e.published = 1 AND t.active = 1
        ORDER BY e.starts_at ASC, e.id ASC`)
      .all().map(eventFromRow);

  const news = selectedTeam
    ? database.prepare(`${joinedNewsSelect}
        WHERE n.published = 1 AND (n.team_id IS NULL OR n.team_id = ?)
        ORDER BY n.published_at DESC, n.id DESC`)
      .all(selectedTeam.id).map(newsFromRow)
    : database.prepare(`${joinedNewsSelect}
        WHERE n.published = 1 AND (n.team_id IS NULL OR t.active = 1)
        ORDER BY n.published_at DESC, n.id DESC`)
      .all().map(newsFromRow);

  const gallery = selectedTeam
    ? database.prepare(`${joinedGallerySelect}
        WHERE g.published = 1 AND (g.team_id IS NULL OR g.team_id = ?)
        ORDER BY g.created_at DESC, g.id DESC`)
      .all(selectedTeam.id).map(galleryFromRow)
    : database.prepare(`${joinedGallerySelect}
        WHERE g.published = 1 AND (g.team_id IS NULL OR t.active = 1)
        ORDER BY g.created_at DESC, g.id DESC`)
      .all().map(galleryFromRow);

  return {
    teams,
    events,
    news,
    gallery,
  };
}

export function validateTeamRequest(input) {
  const value = assertPlainObject(input);
  assertAllowedKeys(value, [
    "requesterName",
    "requesterEmail",
    "teamName",
    "nickname",
    "category",
    "season",
    "description",
  ]);

  return {
    requesterName: requiredString(value.requesterName, "requesterName", { min: 2, max: 100 }),
    requesterEmail: email(value.requesterEmail, "requesterEmail"),
    teamName: requiredString(value.teamName, "teamName", { min: 2, max: 120 }),
    nickname: optionalString(value.nickname, "nickname", { max: 80 }),
    category: requiredString(value.category, "category", { min: 2, max: 80 }),
    season: integer(value.season ?? new Date().getUTCFullYear(), "season", { min: 2000, max: 2100 }),
    description: optionalString(value.description, "description", {
      max: 2000,
      preserveWhitespace: true,
      fallback: "",
    }),
  };
}

export function createTeamRequest(value) {
  const database = getDatabase();
  const result = database.prepare(`
    INSERT INTO team_requests (
      requester_name, requester_email, team_name, nickname, category, season, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    value.requesterName,
    value.requesterEmail,
    value.teamName,
    value.nickname,
    value.category,
    value.season,
    value.description,
  );

  return teamRequestFromRow(
    database.prepare("SELECT * FROM team_requests WHERE id = ?").get(Number(result.lastInsertRowid)),
  );
}

function validateTeam(input) {
  const value = assertPlainObject(input);
  assertAllowedKeys(value, ["slug", "name", "nickname", "category", "season", "description", "active"]);
  const name = requiredString(value.name, "name", { min: 2, max: 120 });

  return {
    slug: value.slug === undefined ? makeSlug(name) : slug(value.slug),
    name,
    nickname: optionalString(value.nickname, "nickname", { max: 80 }),
    category: requiredString(value.category, "category", { min: 2, max: 80 }),
    season: integer(value.season, "season", { min: 2000, max: 2100 }),
    description: optionalString(value.description, "description", {
      max: 2000,
      preserveWhitespace: true,
      fallback: "",
    }),
    active: boolean(value.active, "active", true),
  };
}

function validateEvent(input) {
  const value = assertPlainObject(input);
  assertAllowedKeys(value, [
    "teamId",
    "title",
    "description",
    "kind",
    "startsAt",
    "endsAt",
    "location",
    "status",
    "result",
    "published",
  ]);

  const startsAt = dateTime(value.startsAt, "startsAt");
  const endsAt = optionalDateTime(value.endsAt, "endsAt");

  if (endsAt && Date.parse(endsAt) < Date.parse(startsAt)) {
    throw new ValidationError("Os dados enviados são inválidos.", {
      field: "endsAt",
      message: "A data final não pode ser anterior à data inicial.",
    });
  }

  return {
    teamId: integer(value.teamId, "teamId", { min: 1, max: Number.MAX_SAFE_INTEGER }),
    title: requiredString(value.title, "title", { min: 2, max: 140 }),
    description: optionalString(value.description, "description", {
      max: 3000,
      preserveWhitespace: true,
      fallback: "",
    }),
    kind: oneOf(value.kind, "kind", ["game", "training", "activity"], "activity"),
    startsAt,
    endsAt,
    location: optionalString(value.location, "location", { max: 180 }),
    status: oneOf(value.status, "status", ["scheduled", "completed", "cancelled"], "scheduled"),
    result: optionalString(value.result, "result", { max: 140 }),
    published: boolean(value.published, "published", true),
  };
}

function validateNews(input) {
  const value = assertPlainObject(input);
  assertAllowedKeys(value, [
    "teamId",
    "slug",
    "title",
    "summary",
    "body",
    "publishedAt",
    "published",
  ]);
  const title = requiredString(value.title, "title", { min: 3, max: 160 });

  return {
    teamId: optionalInteger(value.teamId, "teamId", { min: 1, max: Number.MAX_SAFE_INTEGER }),
    slug: value.slug === undefined ? makeSlug(title) : slug(value.slug),
    title,
    summary: requiredString(value.summary, "summary", { min: 5, max: 320 }),
    body: requiredString(value.body, "body", { min: 10, max: 10000, preserveWhitespace: true }),
    publishedAt: dateTime(value.publishedAt, "publishedAt", new Date().toISOString()),
    published: boolean(value.published, "published", true),
  };
}

function validateGallery(input) {
  const value = assertPlainObject(input);
  assertAllowedKeys(value, [
    "teamId",
    "title",
    "imageUrl",
    "altText",
    "caption",
    "published",
  ]);

  return {
    teamId: optionalInteger(value.teamId, "teamId", { min: 1, max: Number.MAX_SAFE_INTEGER }),
    title: requiredString(value.title, "title", { min: 2, max: 140 }),
    imageUrl: webUrl(value.imageUrl, "imageUrl"),
    altText: requiredString(value.altText, "altText", { min: 3, max: 240 }),
    caption: optionalString(value.caption, "caption", { max: 500 }),
    published: boolean(value.published, "published", true),
  };
}

export function validateContent(type, input) {
  if (type === "teams") return validateTeam(input);
  if (type === "events") return validateEvent(input);
  if (type === "news") return validateNews(input);
  if (type === "gallery") return validateGallery(input);
  return null;
}

function selectContentById(database, type, id) {
  if (type === "teams") {
    return teamFromRow(database.prepare("SELECT * FROM teams WHERE id = ?").get(id));
  }
  if (type === "events") {
    return eventFromRow(database.prepare(`${joinedEventSelect} WHERE e.id = ?`).get(id));
  }
  if (type === "news") {
    return newsFromRow(database.prepare(`${joinedNewsSelect} WHERE n.id = ?`).get(id));
  }
  if (type === "gallery") {
    return galleryFromRow(database.prepare(`${joinedGallerySelect} WHERE g.id = ?`).get(id));
  }
  return null;
}

export function createContent(type, value) {
  const database = getDatabase();
  let result;

  if (type === "teams") {
    result = database.prepare(`
      INSERT INTO teams (slug, name, nickname, category, season, description, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      value.slug,
      value.name,
      value.nickname,
      value.category,
      value.season,
      value.description,
      Number(value.active),
    );
  } else if (type === "events") {
    result = database.prepare(`
      INSERT INTO events (
        team_id, title, description, kind, starts_at, ends_at, location, status, result, published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      value.teamId,
      value.title,
      value.description,
      value.kind,
      value.startsAt,
      value.endsAt,
      value.location,
      value.status,
      value.result,
      Number(value.published),
    );
  } else if (type === "news") {
    result = database.prepare(`
      INSERT INTO news (team_id, slug, title, summary, body, published_at, published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      value.teamId,
      value.slug,
      value.title,
      value.summary,
      value.body,
      value.publishedAt,
      Number(value.published),
    );
  } else if (type === "gallery") {
    result = database.prepare(`
      INSERT INTO gallery (team_id, title, image_url, alt_text, caption, published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      value.teamId,
      value.title,
      value.imageUrl,
      value.altText,
      value.caption,
      Number(value.published),
    );
  }

  return selectContentById(database, type, Number(result.lastInsertRowid));
}

export function deleteContent(type, id) {
  const database = getDatabase();
  const record = selectContentById(database, type, id);

  if (!record) {
    return null;
  }

  if (type === "teams" && record.slug === "3b") {
    throw new ValidationError("O time principal não pode ser excluído.", {
      field: "id",
      message: "Mantenha o Terceiro Médio B como time principal do portal.",
    });
  }

  const table = {
    teams: "teams",
    events: "events",
    news: "news",
    gallery: "gallery",
  }[type];

  database.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return record;
}

export function updateTeamRequestStatus(id, status) {
  const database = getDatabase();
  const existing = database.prepare("SELECT id FROM team_requests WHERE id = ?").get(id);

  if (!existing) {
    return null;
  }

  database.prepare(`
    UPDATE team_requests
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

  return teamRequestFromRow(database.prepare("SELECT * FROM team_requests WHERE id = ?").get(id));
}

export function getAdminDashboard() {
  const database = getDatabase();
  const count = (sql) => Number(database.prepare(sql).get().total);

  return {
    stats: {
      teams: count("SELECT COUNT(*) AS total FROM teams"),
      activeTeams: count("SELECT COUNT(*) AS total FROM teams WHERE active = 1"),
      events: count("SELECT COUNT(*) AS total FROM events"),
      news: count("SELECT COUNT(*) AS total FROM news"),
      gallery: count("SELECT COUNT(*) AS total FROM gallery"),
      pendingRequests: count("SELECT COUNT(*) AS total FROM team_requests WHERE status = 'pending'"),
    },
    teams: database.prepare("SELECT * FROM teams ORDER BY created_at DESC, id DESC LIMIT 200")
      .all().map(teamFromRow),
    events: database.prepare(`${joinedEventSelect} ORDER BY e.starts_at DESC, e.id DESC LIMIT 200`)
      .all().map(eventFromRow),
    news: database.prepare(`${joinedNewsSelect} ORDER BY n.published_at DESC, n.id DESC LIMIT 200`)
      .all().map(newsFromRow),
    gallery: database.prepare(`${joinedGallerySelect} ORDER BY g.created_at DESC, g.id DESC LIMIT 200`)
      .all().map(galleryFromRow),
    requests: database.prepare(`
      SELECT * FROM team_requests ORDER BY created_at DESC, id DESC LIMIT 200
    `).all().map(teamRequestFromRow),
  };
}
