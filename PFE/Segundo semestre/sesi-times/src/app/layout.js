import Header from "./components/header";
import Footer from "./components/footer";
import BackToTop from "./components/back-to-top";
import InstallPrompt from "./components/install-prompt";
import "./globals.css";

export const metadata = {
  title: {
    default: "SESI Times | Esporte escolar em Mirandópolis",
    template: "%s | SESI Times",
  },
  description:
    "Conheça os times escolares, acompanhe as turmas e celebre o esporte no SESI Mirandópolis.",
  keywords: ["SESI Times", "esporte escolar", "Mirandópolis", "times escolares"],
  icons: {
    icon: "/sesi-times-mark.svg",
  },
  openGraph: {
    title: "SESI Times",
    description: "Esporte, educação e espírito de equipe no SESI Mirandópolis.",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071c3d",
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function () {
      try {
        var saved = localStorage.getItem("sesi-theme");
        var theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
      } catch (error) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <BackToTop />
        <InstallPrompt />
      </body>
    </html>
  );
}
