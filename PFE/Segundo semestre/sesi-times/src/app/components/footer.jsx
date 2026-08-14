import Link from "next/link";

function FooterMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path d="M20 3 35 11.8v16.4L20 37 5 28.2V11.8L20 3Z" fill="currentColor" />
      <path
        d="m20 10 3.3 6.6 7.3 1.1-5.3 5.1 1.3 7.2-6.6-3.4-6.6 3.4 1.3-7.2-5.3-5.1 7.3-1.1L20 10Z"
        fill="white"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <FooterMark />
          <div>
            <strong>SESI Times</strong>
            <p>Esporte, educação e espírito de equipe.</p>
          </div>
        </div>

        <nav aria-label="Navegação do rodapé">
          <Link href="/">Início</Link>
          <Link href="/times">Times</Link>
          <Link href="/agenda">Agenda</Link>
          <Link href="/noticias">Notícias</Link>
          <Link href="/participar">Participar</Link>
          <Link href="/admin">Administração</Link>
        </nav>
      </div>

      <div className="footer-legal">
        <p>© {new Date().getFullYear()} SESI Times — projeto escolar de Mirandópolis.</p>
        <p>Feito para valorizar quem joga junto.</p>
      </div>
    </footer>
  );
}
