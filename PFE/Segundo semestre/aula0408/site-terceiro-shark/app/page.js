import Image from "next/image";
import Link from "next/link";
import Banner from "./img/banner.png";
import styles from "./page.module.css";

const highlights = [
  { number: "01", label: "Projetos que mostram o que aprendemos" },
  { number: "02", label: "Histórias que constroem nossa identidade" },
  { number: "03", label: "Momentos que merecem ser lembrados" },
];

const portalFeatures = [
  {
    number: "01",
    eyebrow: "Nossa essência",
    title: "Uma turma que deixa sua marca",
    description:
      "Conheça as pessoas, os valores e a energia que transformam o 3º B no Terceiro Shark.",
    href: "/sobre",
    linkLabel: "Conhecer a turma",
  },
  {
    number: "02",
    eyebrow: "Nossos registros",
    title: "Memórias em cada detalhe",
    description:
      "Acompanhe encontros, trabalhos e celebrações que fazem parte da nossa trajetória.",
    href: "/fotos",
    linkLabel: "Abrir a galeria",
  },
  {
    number: "03",
    eyebrow: "Nosso movimento",
    title: "Aprender, criar e compartilhar",
    description:
      "Um espaço vivo para reunir ideias, apresentar projetos e valorizar cada conquista.",
    href: "#nosso-jeito",
    linkLabel: "Ver como fazemos",
  },
];

const steps = [
  {
    number: "01",
    title: "Descobrir",
    description: "Curiosidade para fazer perguntas e olhar além do que já conhecemos.",
  },
  {
    number: "02",
    title: "Construir",
    description: "Colaboração para transformar boas ideias em projetos com propósito.",
  },
  {
    number: "03",
    title: "Compartilhar",
    description: "Coragem para apresentar resultados e crescer com cada experiência.",
  },
];

const quickAnswers = [
  {
    question: "O que é o Terceiro Shark?",
    answer:
      "É o espaço digital do 3º B do SESI Mirandópolis, criado para reunir nossa identidade, nossos projetos e os melhores momentos da turma.",
  },
  {
    question: "Onde posso conhecer melhor a turma?",
    answer:
      "Na página Sobre você encontra a história, os valores e tudo o que representa o nosso jeito de aprender em equipe.",
  },
  {
    question: "Como acompanho os registros?",
    answer:
      "A página Fotos concentra os registros visuais da nossa jornada e pode receber novas memórias ao longo do ano.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="titulo-principal">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                3º B · SESI Mirandópolis
              </p>
              <h1 id="titulo-principal">
                Ideias que ganham <em>profundidade.</em>
              </h1>
            </div>

            <div className={styles.heroIntro}>
              <p>
                Somos uma turma movida por curiosidade, criatividade e união. Este é o
                nosso lugar para mostrar o que fazemos e guardar o que vivemos.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href="/sobre">
                  Conheça nossa história
                  <span aria-hidden="true">→</span>
                </Link>
                <Link className={styles.secondaryButton} href="/fotos">
                  Explorar galeria
                </Link>
              </div>
            </div>
          </div>

          <figure className={styles.heroMedia}>
            <Image
              className={styles.heroImage}
              src={Banner}
              alt="Identidade visual do Terceiro Shark, turma do 3º B"
              priority
              sizes="(max-width: 768px) 100vw, 1180px"
            />
            <figcaption>
              <span>Uma turma.</span>
              <span>Muitas histórias.</span>
            </figcaption>
          </figure>

          <ul className={styles.highlights} aria-label="Destaques do portal">
            {highlights?.map((highlight) => (
              <li key={highlight.number}>
                <span>{highlight.number}</span>
                <p>{highlight.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="recursos-titulo">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Explore o portal</p>
              <h2 id="recursos-titulo">Tudo o que faz parte da nossa jornada.</h2>
            </div>
            <p>
              Um espaço criado para comunicar, preservar memórias e celebrar o trabalho
              que acontece dentro e fora da sala.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {portalFeatures?.length ? (
              portalFeatures.map((feature) => (
                <article className={styles.featureCard} key={feature.number}>
                  <div className={styles.cardTop}>
                    <span>{feature.number}</span>
                    <p>{feature.eyebrow}</p>
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <Link href={feature.href}>
                    {feature.linkLabel}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))
            ) : (
              <p className={styles.emptyState}>Os destaques serão publicados em breve.</p>
            )}
          </div>
        </div>
      </section>

      <section
        id="nosso-jeito"
        className={styles.process}
        aria-labelledby="processo-titulo"
      >
        <div className={styles.container}>
          <div className={styles.processLayout}>
            <div className={styles.processIntro}>
              <p className={styles.sectionEyebrow}>Nosso jeito</p>
              <h2 id="processo-titulo">Juntos, vamos mais longe.</h2>
              <p>
                Cada projeto começa com uma pergunta e cresce quando diferentes talentos
                trabalham na mesma direção.
              </p>
              <Link href="/sobre">
                Saiba mais sobre nós
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ol className={styles.steps}>
              {steps?.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-titulo">
        <div className={styles.container}>
          <div className={styles.faqLayout}>
            <div>
              <p className={styles.sectionEyebrow}>Perguntas rápidas</p>
              <h2 id="faq-titulo">Para navegar sem dúvida.</h2>
            </div>
            <div className={styles.accordion}>
              {quickAnswers?.map((item, index) => (
                <details key={item.question} open={index === 0}>
                  <summary>
                    <span>{item.question}</span>
                    <span className={styles.plusIcon} aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-titulo">
        <div className={styles.container}>
          <div className={styles.ctaPanel}>
            <p className={styles.sectionEyebrow}>Nosso ano em movimento</p>
            <h2 id="cta-titulo">Alguns momentos merecem ficar para sempre.</h2>
            <Link className={styles.lightButton} href="/fotos">
              Visitar a galeria
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
