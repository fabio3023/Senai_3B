import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";

export const metadata = {
  title: {
    default: "Terceiro Shark",
    template: "%s | Terceiro Shark",
  },
  description:
    "O espaço digital do 3º B do SESI Mirandópolis: projetos, histórias e momentos que fazem parte da nossa jornada.",
  keywords: ["Terceiro Shark", "3º B", "SESI Mirandópolis", "projetos escolares"],
};

export const viewport = {
  colorScheme: "light",
  themeColor: "#061a23",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo-principal">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo-principal">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
