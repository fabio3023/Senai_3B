export class ValidationError extends Error {
  constructor(message, details = undefined) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

function fail(field, message) {
  throw new ValidationError("Os dados enviados são inválidos.", {
    field,
    message,
  });
}

export function assertPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("O corpo da requisição deve ser um objeto JSON.");
  }

  return value;
}

export function assertAllowedKeys(value, allowedKeys) {
  const unexpected = Object.keys(value).filter((key) => !allowedKeys.includes(key));

  if (unexpected.length > 0) {
    throw new ValidationError("O corpo contém campos não reconhecidos.", {
      fields: unexpected,
    });
  }
}

export function requiredString(value, field, options = {}) {
  const { min = 1, max = 255, preserveWhitespace = false } = options;

  if (typeof value !== "string") {
    fail(field, "Informe um texto válido.");
  }

  const normalized = preserveWhitespace
    ? value.replace(/\r\n/g, "\n").trim()
    : value.trim().replace(/\s+/g, " ");

  if (normalized.length < min) {
    fail(field, `Use pelo menos ${min} caractere${min === 1 ? "" : "s"}.`);
  }

  if (normalized.length > max) {
    fail(field, `Use no máximo ${max} caracteres.`);
  }

  return normalized;
}

export function optionalString(value, field, options = {}) {
  const { fallback = null } = options;

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return requiredString(value, field, options);
}

export function integer(value, field, options = {}) {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = options;
  const normalized = typeof value === "string" && /^-?\d+$/.test(value)
    ? Number(value)
    : value;

  if (!Number.isSafeInteger(normalized) || normalized < min || normalized > max) {
    fail(field, `Informe um número inteiro entre ${min} e ${max}.`);
  }

  return normalized;
}

export function optionalInteger(value, field, options = {}) {
  if (value === undefined || value === null || value === "") {
    return options.fallback ?? null;
  }

  return integer(value, field, options);
}

export function boolean(value, field, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    fail(field, "Informe true ou false.");
  }

  return value;
}

export function oneOf(value, field, allowed, fallback = undefined) {
  const normalized = value === undefined ? fallback : value;

  if (typeof normalized !== "string" || !allowed.includes(normalized)) {
    fail(field, `Use um dos valores: ${allowed.join(", ")}.`);
  }

  return normalized;
}

export function email(value, field = "email") {
  const normalized = requiredString(value, field, { max: 254 }).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    fail(field, "Informe um endereço de e-mail válido.");
  }

  return normalized;
}

export function slug(value, field = "slug") {
  const normalized = requiredString(value, field, { max: 80 }).toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    fail(field, "Use somente letras sem acento, números e hífens.");
  }

  return normalized;
}

export function makeSlug(value) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  if (!normalized) {
    fail("slug", "Não foi possível gerar um identificador válido.");
  }

  return normalized;
}

export function dateTime(value, field, fallback = undefined) {
  const normalized = value === undefined ? fallback : value;

  if (typeof normalized !== "string" || normalized.length > 50) {
    fail(field, "Informe uma data e hora válidas.");
  }

  const timestamp = Date.parse(normalized);

  if (!Number.isFinite(timestamp)) {
    fail(field, "Informe uma data e hora válidas no formato ISO 8601.");
  }

  return new Date(timestamp).toISOString();
}

export function optionalDateTime(value, field) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return dateTime(value, field);
}

export function webUrl(value, field) {
  const normalized = requiredString(value, field, { max: 2048 });

  if (normalized.startsWith("/") && !normalized.startsWith("//")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      fail(field, "Use uma URL HTTP, HTTPS ou um caminho iniciado por /.");
    }
  } catch {
    fail(field, "Informe uma URL válida.");
  }

  return normalized;
}

