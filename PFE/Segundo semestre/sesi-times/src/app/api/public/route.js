import { getPublicContent } from "@/lib/data";
import { apiError, handleApiError, ok } from "@/lib/http";
import { ValidationError } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const teamValues = request.nextUrl.searchParams.getAll("team");

    if (teamValues.length > 1) {
      throw new ValidationError("Use somente um filtro de time.", { field: "team" });
    }

    const rawTeam = teamValues[0]?.trim().toLowerCase() || null;

    if (rawTeam && (rawTeam.length > 80 || !/^(?:\d+|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(rawTeam))) {
      throw new ValidationError("O filtro de time é inválido.", { field: "team" });
    }

    const data = getPublicContent(rawTeam);

    if (!data) {
      return apiError(404, "TEAM_NOT_FOUND", "O time solicitado não foi encontrado.");
    }

    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

