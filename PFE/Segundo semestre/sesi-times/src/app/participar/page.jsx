import ParticipationForm from "../components/admin/participation-form";
import styles from "./participar.module.css";

export const metadata = {
  title: "Participar",
  description: "Envie uma solicitação para cadastrar um novo time no SESI Times.",
};

export default function ParticiparPage() {
  return (
    <main id="conteudo" tabIndex="-1" className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span>Faça parte do portal</span>
          <h1>Seu time também pode entrar em campo.</h1>
          <p>
            Envie os dados essenciais da equipe. A solicitação ficará pendente até
            a conferência e aprovação da escola.
          </p>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.steps}>
          <span>Como funciona</span>
          <h2>Um processo simples e responsável</h2>
          <ol>
            <li><strong>01</strong><div><h3>Envie a solicitação</h3><p>Preencha somente informações verdadeiras e um contato válido.</p></div></li>
            <li><strong>02</strong><div><h3>Aguarde a análise</h3><p>A administração confere os dados e as autorizações necessárias.</p></div></li>
            <li><strong>03</strong><div><h3>Publicação segura</h3><p>Depois da aprovação, o time pode ser cadastrado no catálogo.</p></div></li>
          </ol>
        </div>
        <ParticipationForm />
      </section>
    </main>
  );
}
