import { createContext, useState } from "react";

export const ContextoTema = createContext(null);

export function TemaProvedor({ children }) {
    const [tema, setTema] = useState('light');

    function mudarTema() { 
        setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    const valor = { tema, mudarTema };

    return (
        <ContextoTema.Provider value={valor}>
            {children}
        </ContextoTema.Provider>
    );
}