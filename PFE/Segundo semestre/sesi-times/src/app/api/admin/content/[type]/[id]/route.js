import { requireAdmin } from "@/lib/auth";
import { CONTENT_TYPES, deleteContent } from "@/lib/data";
import { assertSameOrigin, handleApiError, HttpError, ok } from "@/lib/http";
import { integer } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request, context) {
  try {
    assertSameOrigin(request);
    requireAdmin(request);
    const { type, id: rawId } = await context.params;

    if (!CONTENT_TYPES.includes(type)) {
      throw new HttpError(404, "CONTENT_TYPE_NOT_FOUND", "Tipo de conteúdo não encontrado.");
    }

    const id = integer(rawId, "id", { min: 1, max: Number.MAX_SAFE_INTEGER });
    const deleted = deleteContent(type, id);

    if (!deleted) {
      throw new HttpError(404, "CONTENT_NOT_FOUND", "Conteúdo não encontrado.");
    }

    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
