import { redirect } from "next/navigation";

export default async function EditarAlunoPage({ params }) {
  const { id } = await params;
  redirect(`/cadalunos?editar=${encodeURIComponent(id)}`);
}
