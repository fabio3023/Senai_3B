import crypto from "node:crypto";
import { HttpError } from "@/lib/http";

export const ADMIN_COOKIE_NAME = "sesi_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export function getAuthConfiguration() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.SESSION_SECRET || "";
  const usesExampleValue =
    email.endsWith(".exemplo") ||
    password.startsWith("troque-por-") ||
    secret.startsWith("troque-por-");
  const configured = Boolean(
    email &&
    password.length >= 12 &&
    secret.length >= 32 &&
    !usesExampleValue,
  );

  return {
    configured,
    email,
    password,
    secret,
    secureCookie: process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase() === "true",
  };
}

function requireConfiguration() {
  const configuration = getAuthConfiguration();

  if (!configuration.configured) {
    throw new HttpError(
      503,
      "AUTH_NOT_CONFIGURED",
      "A área administrativa ainda não foi configurada.",
    );
  }

  return configuration;
}

function digest(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest();
}

function safeEqual(left, right, secret) {
  return crypto.timingSafeEqual(digest(left, secret), digest(right, secret));
}

export function verifyAdminCredentials(email, password) {
  const configuration = requireConfiguration();
  const normalizedEmail = email.trim().toLowerCase();

  return safeEqual(normalizedEmail, configuration.email, configuration.secret)
    && safeEqual(password, configuration.password, configuration.secret);
}

export function createAdminSession() {
  const configuration = requireConfiguration();
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    email: configuration.email,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_SECONDS,
  })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", configuration.secret)
    .update(payload)
    .digest("base64url");

  return {
    token: `${payload}.${signature}`,
    expiresAt: new Date((now + SESSION_DURATION_SECONDS) * 1000).toISOString(),
  };
}

function verifySessionToken(token) {
  const configuration = getAuthConfiguration();

  if (!configuration.configured || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payload, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", configuration.secret)
    .update(payload)
    .digest("base64url");

  try {
    const left = Buffer.from(providedSignature, "base64url");
    const right = Buffer.from(expectedSignature, "base64url");

    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (
      data.version !== 1
      || data.email !== configuration.email
      || !Number.isSafeInteger(data.issuedAt)
      || !Number.isSafeInteger(data.expiresAt)
      || data.issuedAt > now + 60
      || data.expiresAt <= now
      || data.expiresAt - data.issuedAt !== SESSION_DURATION_SECONDS
    ) {
      return null;
    }

    return {
      email: data.email,
      issuedAt: new Date(data.issuedAt * 1000).toISOString(),
      expiresAt: new Date(data.expiresAt * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export function getAdminSession(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function requireAdmin(request) {
  const session = getAdminSession(request);

  if (!session) {
    throw new HttpError(401, "UNAUTHORIZED", "Faça login para acessar esta área.");
  }

  return session;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: getAuthConfiguration().secureCookie,
    sameSite: "strict",
    path: "/",
  };
}

export function setAdminCookie(response, session) {
  response.cookies.set(ADMIN_COOKIE_NAME, session.token, {
    ...cookieOptions(),
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(session.expiresAt),
  });
}

export function clearAdminCookie(response) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}
