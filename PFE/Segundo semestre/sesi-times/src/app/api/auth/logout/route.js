import { clearAdminCookie } from "@/lib/auth";
import { assertSameOrigin, handleApiError, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    const response = ok({ authenticated: false });
    clearAdminCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

