import "./globals.css";

export const metadata = {
  title: "SESI Mirandópolis | Escola",
  description: "Página inicial da escola SESI, com informações sobre ensino, inovação e oportunidades para estudantes.",
};

export default function LayoutRaiz({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
