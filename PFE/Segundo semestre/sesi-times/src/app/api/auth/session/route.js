import { getAdminSession, getAuthConfiguration } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = getAdminSession(request);

    return ok({
      configured: getAuthConfiguration().configured,
      authenticated: Boolean(session),
      ...(session ? {
        user: { email: session.email },
        expiresAt: session.expiresAt,
      } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
