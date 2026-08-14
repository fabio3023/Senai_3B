import Link from "next/link";
import { ArrowIcon } from "./components/icons";

export default function NotFound() {
  return (
    <main id="conteudo" className="feedback-page" tabIndex="-1">
      <div className="feedback-card">
        <span className="feedback-code">404</span>
        <p className="eyebrow eyebrow-dark">Página não encontrada</p>
        <h1>Esse caminho saiu da quadra.</h1>
        <p>A página que você procurou não existe ou mudou de endereço.</p>
        <Link className="button button-primary" href="/">
          Voltar ao início <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
