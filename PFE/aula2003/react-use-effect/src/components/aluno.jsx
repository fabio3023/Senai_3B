import { useState, useEffect } from "react";

export default function Aluno(){
    const [nome, setNome] = useState('');
    const [idade, setIdate] = useState(0);

    //executa toda vez
    useEffect(() =>{
        console.log('App renderizado!');
    })

   //executa na montagem do componente
    useEffect(() =>{
        console.log('App montado!');
    },[])

   //executa na montagem e na mudança de um prop ou estado
    useEffect(() =>{
        console.log('O nome mudou para ,', nome);
    },[nome])
   //executa na montagem e na mudança de um prop ou estado
    useEffect(() =>{
        console.log('A idade mudou para ,', idade);
    },[idade])

    return(
        <>
            <form action="">
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}/>
                <input type="text" value={idade} onChange={(e) => setIdate(e.target.value)}/>
            </form>
        </>
    )

}