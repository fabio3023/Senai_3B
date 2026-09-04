import Link from "next/link";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark}>S</div>
        <div>
          <p className={styles.eyebrow}>SESI</p>
          <h1 className={styles.title}>Escola</h1>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Menu principal">
        <Link href="/">Início</Link>
        <Link href="/principal">Sobre</Link>
        <Link href="/alunos">Cadastro</Link>
        <Link href="/listalunos">Lista</Link>
        <Link href="/cadnotas">Notas</Link>
      </nav>
    </header>
  );
} 
