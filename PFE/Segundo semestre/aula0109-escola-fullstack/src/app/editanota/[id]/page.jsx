import { redirect } from "next/navigation";

export default async function EditarNotaPage({ params }) {
  const { id } = await params;
  redirect(`/cadnotas?editar=${encodeURIComponent(id)}`);
}
