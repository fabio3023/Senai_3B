import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/validation";

const MAX_JSON_BYTES = 32 * 1024;

export async function readJson(request, maxBytes = MAX_JSON_BYTES) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Envie o corpo como application/json.");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "O corpo da requisição é muito grande.");
  }

  const text = await request.text();
  if (!text.trim()) {
    throw new ValidationError("O corpo JSON é obrigatório.");
  }

  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "O corpo da requisição é muito grande.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError("O corpo contém JSON inválido.");
  }
}

export class HttpError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function responseHeaders(extraHeaders = {}) {
  return {
    "Cache-Control": "no-store",
    ...extraHeaders,
  };
}

export function ok(data, options = {}) {
  const { status = 200, headers } = options;
  return NextResponse.json(data, {
    status,
    headers: responseHeaders(headers),
  });
}

export function apiError(status, code, message, details = undefined) {
  return NextResponse.json({
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  }, {
    status,
    headers: responseHeaders(),
  });
}

export function handleApiError(error) {
  if (error instanceof HttpError) {
    return apiError(error.status, error.code, error.message, error.details);
  }

  if (error instanceof ValidationError) {
    return apiError(400, "VALIDATION_ERROR", error.message, error.details);
  }

  const sqliteMessage = error instanceof Error ? error.message : "";

  if (/UNIQUE constraint failed/i.test(sqliteMessage)) {
    return apiError(409, "CONFLICT", "Já existe um registro com esses dados únicos.");
  }

  if (/FOREIGN KEY constraint failed/i.test(sqliteMessage)) {
    return apiError(400, "INVALID_REFERENCE", "O time informado não existe.");
  }

  if (/CHECK constraint failed|NOT NULL constraint failed/i.test(sqliteMessage)) {
    return apiError(400, "INVALID_DATA", "Os dados não atendem às regras do cadastro.");
  }

  console.error("SESI Times API error:", error);
  return apiError(500, "INTERNAL_ERROR", "Não foi possível concluir a operação.");
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");

  if (!origin) return;

  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new HttpError(403, "INVALID_ORIGIN", "A origem da requisição não é permitida.");
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const requestHost = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const requestProtocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");
  const protocolAllowed = requestProtocol === "http" || requestProtocol === "https";

  if (
    !requestHost ||
    !protocolAllowed ||
    originUrl.host.toLowerCase() !== requestHost.toLowerCase() ||
    originUrl.protocol !== `${requestProtocol}:`
  ) {
    throw new HttpError(403, "INVALID_ORIGIN", "A origem da requisição não é permitida.");
  }
}
