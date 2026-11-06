export {
  buscarNota as GET,
  editarNota as PUT,
  excluirNota as DELETE,
} from "../../../../lib/server/controllers/notas.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
