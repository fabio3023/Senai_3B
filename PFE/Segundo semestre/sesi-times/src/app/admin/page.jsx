import AdminApp from "../components/admin/admin-app";

export const metadata = {
  title: "Administração",
  description: "Painel protegido para gerenciar o conteúdo do SESI Times.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main id="conteudo" tabIndex="-1">
      <AdminApp />
    </main>
  );
}
