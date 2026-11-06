"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./registro.module.css";

export default function Registro() {
  const router = useRouter();

  function salvarRegistro(evento) {
    evento.preventDefault();
    router.push("/login");
  }

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="titulo-registro">
        <Link href="/" className={styles.marca}>SESI Escola</Link>
        <p className={styles.eyebrow}>Novo acesso</p>
        <h1 id="titulo-registro">Criar registro</h1>
        <p className={styles.descricao}>Preencha os dados abaixo para continuar.</p>

        <form className={styles.formulario} onSubmit={salvarRegistro}>
          <label htmlFor="usuario">Usuário</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            autoComplete="username"
            placeholder="Escolha um usuário"
            required
          />

          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            placeholder="Digite seu nome"
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha"
            required
          />

          <button type="submit" className={styles.botaoPrincipal}>Salvar registro</button>
        </form>

        <p className={styles.alternativa}>
          Já tem cadastro? <Link href="/login">Ir para o login</Link>
        </p>
      </section>
    </main>
  );
}
