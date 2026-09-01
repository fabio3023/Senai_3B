import Link from "next/link";
import Header from "../components/header";
import styles from "./page.module.css";

const destaques = [
  { valor: "+50", label: "anos de história" },
  { valor: "18", label: "áreas de atuação" },
  { valor: "96%", label: "satisfação" },
  { valor: "24h", label: "apoio à aprendizagem" },
];

const pilares = [
  {
    title: "Ensino de excelência",
    text: "Metodologias ativas, laboratórios modernos e uma proposta pedagógica que conecta teoria, prática e formação profissional relevante.",
  },
  {
    title: "Ambiente acolhedor",
    text: "Estrutura moderna, atendimento humano e uma rotina escolar pensada para apoiar o desenvolvimento integral do estudante.",
  },
  {
    title: "Oportunidades reais",
    text: "Parcerias, eventos e projetos que ampliam a visão dos alunos e fortalecem a conexão com o futuro profissional.",
  },
];

const programas = [
  "Educação Básica",
  "Ensino Técnico",
  "Qualificação Profissional",
  "Ações Socioeducativas",
];

const servicos = [
  {
    titulo: "Formação integral",
    texto: "Desenvolvemos competências acadêmicas, sociais e profissionais para que cada estudante alcance seu potencial.",
  },
  {
    titulo: "Inovação pedagógica",
    texto: "Aulas com apoio tecnológico e metodologias que estimulem criatividade, autonomia e pensamento crítico.",
  },
  {
    titulo: "Conexão com o futuro",
    texto: "Projetos e parcerias que aproximam alunos de oportunidades profissionais, empreendedoras e acadêmicas.",
  },
];

const noticias = [
  {
    categoria: "Educação",
    titulo: "Feira de tecnologia e inovação reúne estudantes e professores em projetos de impacto social.",
  },
  {
    categoria: "Cultura",
    titulo: "Programação cultural amplia oportunidades de expressão, criatividade e participação comunitária.",
  },
  {
    categoria: "Esporte",
    titulo: "Atividades esportivas fortalecem disciplina, saúde e trabalho em equipe entre os alunos.",
  },
];

export default function Principal() {
  return (
    <div className="page-shell">
      <Header />

      <main className={styles.heroSection}>
        <section className={styles.heroText}>
          <span className={styles.badge}>SESI • Educação com propósito</span>
          <h1 className="section-title">Formando líderes, profissionais e cidadãos.</h1>
          <p className="section-copy">
            A Escola SESI é uma referência em educação de qualidade, com foco em desenvolvimento humano,
            inovação, cidadania e preparação para os desafios do mundo contemporâneo.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>Conhecer a escola</Link>
            <Link href="/cadnotas" className={styles.secondaryButton}>Saiba mais</Link>
          </div>

          <div className={styles.segmentos}>
            {programas.map((item) => (
              <span key={item} className={styles.segmentoTag}>{item}</span>
            ))}
          </div>

          <div className={styles.statsGrid}>
            {destaques.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <strong>{item.valor}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className={`${styles.heroCard} section-panel`}>
          <div className={styles.cardHeader}>
            <span>Agenda institucional</span>
            <strong>2026</strong>
          </div>

          <ul className={styles.listAgenda}>
            <li>
              <span className={styles.dateTag}>Set</span>
              <div>
                <h3>Semana de inovação</h3>
                <p>Atividades práticas e palestras com profissionais e especialistas do setor.</p>
              </div>
            </li>
            <li>
              <span className={styles.dateTag}>Out</span>
              <div>
                <h3>Feira de projetos</h3>
                <p>Apresentação de trabalhos e soluções desenvolvidas pelos alunos.</p>
              </div>
            </li>
            <li>
              <span className={styles.dateTag}>Nov</span>
              <div>
                <h3>Concurso de talentos</h3>
                <p>Espaço para protagonismo, criatividade e expressão cultural dos estudantes.</p>
              </div>
            </li>
          </ul>
        </aside>
      </main>

      <section className={styles.missaoSection}>
        <div className={styles.missaoTexto}>
          <span className={styles.badge}>Nossa missão</span>
          <h2 className="section-title">Uma educação que transforma potencial em oportunidades reais.</h2>
          <p className="section-copy">
            Promovemos uma aprendizagem de qualidade com foco em desenvolvimento, inclusão, cidadania e
            excelência acadêmica, preparando os estudantes para uma atuação consciente e protagonista no mundo.
          </p>
        </div>

        <div className={styles.missaoBox}>
          <div className={styles.missaoBoxHeader}>
            <span>Valores institucionais</span>
            <strong>SESI</strong>
          </div>
          <ul>
            <li>Excelência acadêmica</li>
            <li>Inclusão e respeito</li>
            <li>Inovação e tecnologia</li>
            <li>Compromisso social</li>
          </ul>
        </div>
      </section>

      <section className={styles.pilaresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>O que nos diferencia</span>
          <h2 className="section-title">Uma instituição que transforma potencial em trajetória.</h2>
        </div>

        <div className={styles.cardGrid}>
          {pilares.map((item) => (
            <article key={item.title} className={`${styles.pilarCard} section-panel`}>
              <div className={styles.iconWrapper}>✓</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.servicosSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>Nossos diferenciais</span>
          <h2 className="section-title">Uma escola pensada para o futuro.</h2>
        </div>

        <div className={styles.servicosGrid}>
          {servicos.map((item) => (
            <article key={item.titulo} className={styles.servicoCard}>
              <div className={styles.servicoNumero}>0{servicos.indexOf(item) + 1}</div>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.noticiasSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>Últimas notícias</span>
          <h2 className="section-title">Ações, eventos e oportunidades em destaque.</h2>
        </div>

        <div className={styles.noticiasGrid}>
          {noticias.map((item) => (
            <article key={item.titulo} className={styles.noticiaCard}>
              <span className={styles.noticiaCategoria}>{item.categoria}</span>
              <h3>{item.titulo}</h3>
              <Link href="/" className={styles.linkNoticia}>Leia mais</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
          <span className={styles.badge}>Junte-se a nós</span>
          <h2 className="section-title">Uma comunidade que valoriza aprendizagem, cultura e transformação.</h2>
        </div>
        <Link href="/cadnotas" className={styles.primaryButton}>Fale com a instituição</Link>
      </section>
    </div>
  );
}
