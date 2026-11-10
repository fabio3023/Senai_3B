import Link from "next/link";
import estilos from "./header.module.css";

export default function Cabecalho() {
  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.marca}>
        <div className={estilos.simbolo}>S</div>
        <div>
          <p className={estilos.destaque}>SESI</p>
          <h1 className={estilos.titulo}>Escola</h1>
        </div>
      </div>

      <nav className={estilos.navegacao} aria-label="Menu principal">
        <Link href="/">Início</Link>
        <Link href="/principal">Sobre</Link>
        <Link href="/cadalunos">Cadastrar aluno</Link>
        <Link href="/cadprofessores">Professores</Link>
        <Link href="/listalunos">Alunos</Link>
        <Link href="/cadnotas">Lançar notas</Link>
        <Link href="/notas">Boletins</Link>
        <Link href="/login">Entrar</Link>
      </nav>
    </header>
  );
}
