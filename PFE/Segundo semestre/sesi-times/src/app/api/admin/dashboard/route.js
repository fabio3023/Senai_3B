import { requireAdmin } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/data";
import { handleApiError, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    requireAdmin(request);
    return ok(getAdminDashboard());
  } catch (error) {
    return handleApiError(error);
  }
}
