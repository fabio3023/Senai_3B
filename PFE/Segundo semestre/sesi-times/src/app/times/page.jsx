import Link from "next/link";
import {
  ArrowIcon,
  CalendarIcon,
  CheckIcon,
  UsersIcon,
} from "../components/icons";
import TeamExplorer from "../components/team-explorer";
import { getPublicContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Times",
  description: "Conheça os times e as turmas que representam o SESI Times.",
};

const portalFeatures = [
  {
    icon: UsersIcon,
    number: "01",
    title: "Identidade",
    text: "O nome, a personalidade e os valores que tornam cada turma única.",
  },
  {
    icon: CalendarIcon,
    number: "02",
    title: "Atualizações",
    text: "Um espaço preparado para receber agenda, novidades e resultados.",
  },
  {
    icon: CheckIcon,
    number: "03",
    title: "Histórias",
    text: "Conquistas que vão além do placar e aproximam toda a comunidade escolar.",
  },
];

const initialTeams = [
  {
    id: 1,
    slug: "3b",
    name: "Terceiro Médio B",
    nickname: "The Best",
    category: "Ensino Médio",
    season: "2026",
    description: "União, atitude e vontade de evoluir em cada novo desafio.",
    active: true,
  },
];

export default function Times() {
  const liveTeams = getPublicContent()?.teams ?? initialTeams;

  return (
    <main id="conteudo" tabIndex="-1">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <nav className="breadcrumb" aria-label="Navegação estrutural">
              <Link href="/">Início</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Times</span>
            </nav>
            <span className="eyebrow"><i /> Nossa escola, nossas equipes</span>
            <h1>Times que representam <span>quem somos.</span></h1>
            <p>
              Conheça as turmas cadastradas, descubra suas identidades e acompanhe
              este espaço crescer com novas histórias.
            </p>
          </div>
          <div className="page-hero-emblem" aria-hidden="true">
            <span>ST</span>
            <i className="emblem-ring emblem-ring-one" />
            <i className="emblem-ring emblem-ring-two" />
          </div>
        </div>
      </section>

      <section className="section teams-catalogue">
        <div className="container">
          <div className="section-heading catalogue-heading">
            <div>
              <span className="eyebrow eyebrow-dark">Temporada 2026</span>
              <h2>Equipes cadastradas</h2>
              <p>Este catálogo será atualizado conforme novos times entrarem no portal.</p>
            </div>
          </div>
          <TeamExplorer initialTeams={liveTeams} />
        </div>
      </section>

      <section className="section portal-features-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <span className="eyebrow eyebrow-dark">Dentro de cada time</span>
            <h2>Um lugar para guardar o que importa</h2>
          </div>
          <div className="portal-features-grid">
            {portalFeatures.map(({ icon: FeatureIcon, number, title, text }) => (
              <article className="portal-feature" key={number}>
                <span className="portal-feature-number">{number}</span>
                <span className="icon-box"><FeatureIcon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compact-cta-section">
        <div className="container compact-cta">
          <div>
            <strong>Seu time ainda não está no portal?</strong>
            <p>Envie uma solicitação para a equipe responsável.</p>
          </div>
          <Link className="button button-primary" href="/participar">
            Solicitar cadastro <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
