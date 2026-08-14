import Link from "next/link";
import {
  ArrowIcon,
  ArrowUpRightIcon,
  HeartIcon,
  ShieldIcon,
  SparkIcon,
  TrophyIcon,
  UsersIcon,
} from "./components/icons";
import HomeFeed from "./components/home-feed";
import { getPublicContent } from "@/lib/data";

export const dynamic = "force-dynamic";

const DEFAULT_SEASON = new Date().getFullYear();

function teamBadge(team) {
  return String(team?.slug || "ST").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "ST";
}

const values = [
  {
    icon: UsersIcon,
    title: "Jogar junto",
    text: "Cada pessoa tem um papel. Em quadra e fora dela, o resultado nasce da colaboração.",
  },
  {
    icon: ShieldIcon,
    title: "Respeitar sempre",
    text: "Competir com responsabilidade, acolher as diferenças e valorizar quem está ao lado.",
  },
  {
    icon: TrophyIcon,
    title: "Evoluir a cada jogo",
    text: "Mais do que o placar, celebramos esforço, disciplina e tudo o que aprendemos no caminho.",
  },
];

function HeroVisual({ team }) {
  const displayTeam = team || {
    name: "SESI Times",
    nickname: "Sua equipe",
    season: DEFAULT_SEASON,
  };

  return (
    <div
      className="hero-visual"
      role="img"
      aria-label={`Ilustração de uma quadra esportiva com ${displayTeam.name} em destaque`}
    >
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="court-card">
        <div className="court-card-top">
          <span>Temporada {displayTeam.season || DEFAULT_SEASON}</span>
          <span className="portal-status"><i /> Portal ativo</span>
        </div>
        <div className="court" aria-hidden="true">
          <span className="court-midline" />
          <span className="court-circle" />
          <span className="court-area court-area-left" />
          <span className="court-area court-area-right" />
          <span className="sport-ball"><i /><i /><i /></span>
        </div>
        <div className="court-caption">
          <span className="mini-shield">{teamBadge(displayTeam)}</span>
          <span>
            <small>Time em destaque</small>
            <strong>{displayTeam.name}</strong>
          </span>
          <ArrowUpRightIcon />
        </div>
      </div>
      <div className="floating-tag floating-tag-top">
        <SparkIcon />
        <span><strong>Energia</strong><small>que conecta</small></span>
      </div>
      <div className="floating-tag floating-tag-bottom">
        <HeartIcon />
        <span><strong>Um só time</strong><small>muitas histórias</small></span>
      </div>
    </div>
  );
}

export default function Home() {
  const featuredTeam = getPublicContent()?.teams?.[0] ?? null;
  const featuredHref = featuredTeam ? `/times/${featuredTeam.slug}` : "/participar";

  return (
    <main id="conteudo" tabIndex="-1">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><i /> Esporte escolar • Mirandópolis</span>
            <h1>Onde cada turma <span>joga como um time.</span></h1>
            <p>
              Um espaço para conhecer nossas equipes, compartilhar conquistas e
              fortalecer os valores que levamos da escola para a vida.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/times">
                Conhecer os times <ArrowIcon />
              </Link>
              <Link className="button button-secondary" href={featuredHref}>
                {featuredTeam ? `Ver ${featuredTeam.name}` : "Cadastrar um time"}
              </Link>
            </div>
            <ul className="hero-notes" aria-label="Destaques do portal">
              <li><span>✓</span> Conteúdo escolar</li>
              <li><span>✓</span> Feito para a comunidade</li>
            </ul>
          </div>
          <HeroVisual team={featuredTeam} />
        </div>
      </section>

      <section className="mission-strip" aria-label="Nossa missão">
        <div className="container mission-grid">
          <p>Nossa torcida acredita em</p>
          <strong>união</strong><i />
          <strong>respeito</strong><i />
          <strong>superação</strong><i />
          <strong>pertencimento</strong>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow eyebrow-dark">Em destaque</span>
              <h2>Conheça quem veste a camisa</h2>
            </div>
            <Link className="text-link" href="/times">
              Ver todos os times <ArrowIcon />
            </Link>
          </div>

          <Link className="featured-team-card" href={featuredHref}>
            <div className="team-poster" aria-hidden="true">
              <span className="poster-number">{teamBadge(featuredTeam)}</span>
              <span className="poster-name">{featuredTeam?.nickname || "Sua equipe"}</span>
              <span className="poster-line" />
            </div>
            <div className="featured-team-content">
              <span className="status-pill"><i /> {featuredTeam ? "Time cadastrado" : "Cadastro aberto"}</span>
              <p className="team-kicker">
                {featuredTeam
                  ? `${featuredTeam.category} • ${featuredTeam.season}`
                  : "Portal escolar • Novas equipes"}
              </p>
              <h3>{featuredTeam?.name || "Seu time pode ser o próximo"}</h3>
              <p>
                {featuredTeam?.description ||
                  "Envie uma solicitação e apresente a identidade da sua equipe à comunidade escolar."}
              </p>
              <span className="card-action">
                {featuredTeam ? "Conhecer o time" : "Solicitar cadastro"} <ArrowUpRightIcon />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="section values-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <span className="eyebrow eyebrow-dark">Muito além do placar</span>
            <h2>Valores que entram em quadra</h2>
            <p>O esporte também é uma forma de aprender, conviver e construir confiança.</p>
          </div>
          <div className="values-grid">
            {values.map(({ icon: ValueIcon, title, text }, index) => (
              <article className="value-card" key={title}>
                <span className="value-number">0{index + 1}</span>
                <span className="icon-box"><ValueIcon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeFeed />

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <span className="eyebrow eyebrow-light">Prontos para torcer?</span>
              <h2>Cada time merece ter sua história contada.</h2>
              <p>Explore o portal e conheça as turmas que fazem o esporte escolar acontecer.</p>
            </div>
            <Link className="button button-light" href="/times">
              Explorar os times <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
