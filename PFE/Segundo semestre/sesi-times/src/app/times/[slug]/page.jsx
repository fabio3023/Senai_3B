import { getPublicContent } from "@/lib/data";
import { notFound } from "next/navigation";
import TeamProfileView from "../../components/public/TeamProfileView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const content = getPublicContent(slug);
  const team = content?.teams?.[0];

  if (!team) {
    return {
      title: "Time não encontrado",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: team.name,
    description: team.description || `Conheça o time ${team.name} no SESI Times.`,
  };
}

export default async function DynamicTeamPage({ params }) {
  const { slug } = await params;

  if (!getPublicContent(slug)) {
    notFound();
  }

  return <TeamProfileView requestedSlug={slug} />;
}
