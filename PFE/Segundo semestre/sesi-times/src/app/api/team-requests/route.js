import { createTeamRequest, validateTeamRequest } from "@/lib/data";
import { assertSameOrigin, handleApiError, ok, readJson } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertPlainObject, ValidationError } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit(request, { scope: "team-request", limit: 8, windowMs: 60 * 60 * 1000 });
    const payload = assertPlainObject(await readJson(request));
    const { consent, website, ...requestData } = payload;

    if (typeof website !== "undefined" && typeof website !== "string") {
      throw new ValidationError("Os dados enviados são inválidos.");
    }

    if (website?.trim()) {
      return ok({
        item: null,
        message: "Solicitação enviada para análise.",
      }, { status: 201 });
    }

    if (consent !== true) {
      throw new ValidationError("Confirme o uso dos dados para enviar a solicitação.", {
        field: "consent",
        message: "A confirmação de uso dos dados é obrigatória.",
      });
    }

    const input = validateTeamRequest(requestData);
    const created = createTeamRequest(input);

    return ok({
      item: {
        id: created.id,
        teamName: created.teamName,
        status: created.status,
        createdAt: created.createdAt,
      },
      message: "Solicitação enviada para análise.",
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
