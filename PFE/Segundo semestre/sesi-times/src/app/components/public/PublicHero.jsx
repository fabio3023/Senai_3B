import Link from "next/link";
import styles from "./PublicHero.module.css";

const icons = {
  agenda: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M8 14h3" />
    </>
  ),
  news: (
    <>
      <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" />
      <path d="M9 8h6M9 12h6M9 16h3M5 18H3V7h2" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-4-4L6 20" />
    </>
  ),
  team: (
    <>
      <path d="M12 21s7-3.5 7-9V5l-7-2.5L5 5v7c0 5.5 7 9 7 9Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
};

export default function PublicHero({ eyebrow, title, description, icon = "agenda", children }) {
  return (
    <header className={styles.hero}>
      <div className={styles.orbit} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <div className={styles.content}>
          <div>
            <span className={styles.eyebrow}><i aria-hidden="true" /> {eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            {children ? <div className={styles.actions}>{children}</div> : null}
          </div>
          <span className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {icons[icon] || icons.agenda}
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
}
