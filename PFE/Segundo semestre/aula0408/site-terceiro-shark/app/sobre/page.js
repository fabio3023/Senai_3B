import Link from "next/link";
import styles from "../page.module.css";

export const metadata = {
  title: "Sobre",
  description: "Conheça a identidade e os valores da turma Terceiro Shark.",
};

export default function Sobre() {
  return (
    <section className={styles.interiorPage} aria-labelledby="sobre-titulo">
      <div className={styles.container}>
        <p className={styles.sectionEyebrow}>Sobre a turma</p>
        <h1 id="sobre-titulo">Uma turma feita de diferentes talentos.</h1>
        <p className={styles.interiorLead}>
          Esta página está pronta para receber a história, os integrantes e os projetos
          que traduzem a identidade do Terceiro Shark.
        </p>
        <Link className={styles.primaryButton} href="/">
          Voltar ao início
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
