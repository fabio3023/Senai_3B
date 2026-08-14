import { HttpError } from "@/lib/http";

const RATE_LIMIT_KEY = Symbol.for("sesi-times.rate-limits");

function getStore() {
  if (!globalThis[RATE_LIMIT_KEY]) globalThis[RATE_LIMIT_KEY] = new Map();
  return globalThis[RATE_LIMIT_KEY];
}

function clientAddress(request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "local";
}

export function enforceRateLimit(request, { scope, limit, windowMs }) {
  const store = getStore();
  const now = Date.now();
  const key = `${scope}:${clientAddress(request)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    current.count += 1;
    if (current.count > limit) {
      throw new HttpError(
        429,
        "RATE_LIMITED",
        "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.",
        { retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) },
      );
    }
  }

  if (store.size > 1000) {
    for (const [storedKey, entry] of store) {
      if (entry.resetAt <= now) store.delete(storedKey);
    }
  }
}
