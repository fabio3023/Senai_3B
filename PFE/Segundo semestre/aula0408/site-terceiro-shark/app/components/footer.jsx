import Link from "next/link";
import styles from "./footer.module.css";

const footerLinks = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre a turma" },
  { href: "/fotos", label: "Galeria" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link className={styles.brand} href="/">
              <span className={styles.brandMark} aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path d="M8 31c8-2 13-8 17-19 2 8 7 14 15 18-8 0-14 2-19 7-3-3-7-5-13-6Z" />
                </svg>
              </span>
              <span>Terceiro Shark</span>
            </Link>
            <p>
              Ideias, projetos e memórias do 3º B do SESI Mirandópolis em um só lugar.
            </p>
          </div>

          <nav className={styles.navigation} aria-label="Navegação do rodapé">
            <p>Explore</p>
            <ul>
              {footerLinks?.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Terceiro Shark.</p>
          <p>Feito com criatividade pelo 3º B.</p>
        </div>
      </div>
    </footer>
  );
}
