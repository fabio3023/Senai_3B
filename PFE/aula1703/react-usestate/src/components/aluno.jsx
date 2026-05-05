import { useState } from "react";

export default function Aluno({titulo}){
    const [nome, setNome] = useState('Isabella');
    const [idade, setIdade] = useState(17);
    const [ra, setRA] = useState(490909);
    const [nota, setNota] = useState(10);

    return(
        <>
        <h1>{titulo}</h1>
        <h3>{nome}</h3>
        <h4>{idade}</h4>
        <h4>{ra}</h4>
        <h4>{nota}</h4>
        </>
    )
}