import { requireAdmin } from "@/lib/auth";
import { CONTENT_TYPES, createContent, validateContent } from "@/lib/data";
import {
  assertSameOrigin,
  handleApiError,
  HttpError,
  ok,
  readJson,
} from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, context) {
  try {
    assertSameOrigin(request);
    requireAdmin(request);
    const { type } = await context.params;

    if (!CONTENT_TYPES.includes(type)) {
      throw new HttpError(404, "CONTENT_TYPE_NOT_FOUND", "Tipo de conteúdo não encontrado.");
    }

    const value = validateContent(type, await readJson(request));
    const created = createContent(type, value);
    return ok({
      item: created,
      message: "Conteúdo cadastrado com sucesso.",
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
