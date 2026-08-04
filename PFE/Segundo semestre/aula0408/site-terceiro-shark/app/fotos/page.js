import Link from "next/link";
import styles from "../page.module.css";

export const metadata = {
  title: "Fotos",
  description: "Galeria de momentos e projetos da turma Terceiro Shark.",
};

export default function Fotos() {
  return (
    <section className={styles.interiorPage} aria-labelledby="fotos-titulo">
      <div className={styles.container}>
        <p className={styles.sectionEyebrow}>Galeria</p>
        <h1 id="fotos-titulo">Memórias que contam a nossa história.</h1>
        <p className={styles.interiorLead}>
          A estrutura da galeria já está integrada à navegação e pode receber novos
          registros com segurança, usando imagens otimizadas pelo Next.js.
        </p>
        <Link className={styles.primaryButton} href="/">
          Voltar ao início
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
