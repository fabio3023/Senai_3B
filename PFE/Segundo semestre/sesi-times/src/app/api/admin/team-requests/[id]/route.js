import { requireAdmin } from "@/lib/auth";
import { updateTeamRequestStatus } from "@/lib/data";
import {
  assertSameOrigin,
  handleApiError,
  HttpError,
  ok,
  readJson,
} from "@/lib/http";
import {
  assertAllowedKeys,
  assertPlainObject,
  integer,
  oneOf,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, context) {
  try {
    assertSameOrigin(request);
    requireAdmin(request);
    const { id: rawId } = await context.params;
    const id = integer(rawId, "id", { min: 1, max: Number.MAX_SAFE_INTEGER });
    const body = assertPlainObject(await readJson(request, 4 * 1024));
    assertAllowedKeys(body, ["status"]);
    const status = oneOf(body.status, "status", ["approved", "rejected"]);
    const updated = updateTeamRequestStatus(id, status);

    if (!updated) {
      throw new HttpError(404, "TEAM_REQUEST_NOT_FOUND", "Solicitação não encontrada.");
    }

    return ok({
      item: updated,
      message: status === "approved"
        ? "Solicitação aprovada."
        : "Solicitação rejeitada.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
