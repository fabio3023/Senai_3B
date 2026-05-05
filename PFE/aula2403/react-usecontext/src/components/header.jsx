import { useContext } from "react";
import { ContextoTema } from '../contextos/temaContexto';

export default function Header() { 
    const { tema, mudarTema } = useContext(ContextoTema);

    return (
        <header className={`header-${tema}`}>
            <h1>Altas Notícias</h1>
            <button onClick={mudarTema}>
                Mudar tema para {tema === 'light' ? 'escuro' : 'claro'}
            </button>
            <p className="card-container">Christopher Nolan e seu projeto mais ambicioso, A Odisseia.</p>
        </header>
    );
}