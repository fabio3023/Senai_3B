import {
  createAdminSession,
  setAdminCookie,
  verifyAdminCredentials,
} from "@/lib/auth";
import { assertSameOrigin, handleApiError, HttpError, ok, readJson } from "@/lib/http";
import {
  assertAllowedKeys,
  assertPlainObject,
  email,
  ValidationError,
} from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, { scope: "admin-login", limit: 5, windowMs: 15 * 60 * 1000 });
    const body = assertPlainObject(await readJson(request, 8 * 1024));
    assertAllowedKeys(body, ["email", "password"]);
    const submittedEmail = email(body.email);

    if (typeof body.password !== "string" || body.password.length < 1 || body.password.length > 512) {
      throw new ValidationError("Os dados enviados são inválidos.", {
        field: "password",
        message: "Informe uma senha válida.",
      });
    }

    const password = body.password;

    if (!verifyAdminCredentials(submittedEmail, password)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
    }

    const session = createAdminSession();
    const response = ok({
      authenticated: true,
      user: { email: submittedEmail },
      expiresAt: session.expiresAt,
    });
    setAdminCookie(response, session);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
