"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();

  function entrar(evento) {
    evento.preventDefault();
    router.push("/principal");
  }

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="titulo-login">
        <Link href="/" className={styles.marca}>SESI Escola</Link>
        <p className={styles.eyebrow}>Acesso ao sistema</p>
        <h1 id="titulo-login">Bem-vindo de volta</h1>
        <p className={styles.descricao}>Entre com seu usuário e senha para continuar.</p>

        <form className={styles.formulario} onSubmit={entrar}>
          <label htmlFor="usuario">Usuário</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            autoComplete="username"
            placeholder="Digite seu usuário"
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
          />

          <button type="submit" className={styles.botaoPrincipal}>Entrar no sistema</button>
        </form>

        <p className={styles.alternativa}>
          Ainda não tem cadastro? <Link href="/registro">Criar registro</Link>
        </p>
      </section>
    </main>
  );
}
