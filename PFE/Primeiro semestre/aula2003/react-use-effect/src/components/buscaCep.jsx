import { useState, useEffect } from "react";


export default function BuscaCep(){
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState(null) 

    useEffect(() =>{
        if(cep.length == 8){
            fetch(`https://viacep.com.br/ws/${cep}/json/`).then(response => response.json()).then(data => {
                if(!data.erro){
                    setEndereco(data);
                }else{
                    setEndereco(null);
                    alert('Cep não localizado');
                }
            }).catch(error => console.error('Erro ao acessar ', error))
        }
    },[cep])

    return(
        <>
            <h1>Busca Cep</h1>
            <input 
                type="number"
                placeholder="Digite para pesquisar"
                maxLength="8"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                />
                {endereco && (
                    <div>
                        <p>Logradouro: {endereco.logradouro}</p>
                        <p>Bairro: {endereco.bairro} </p>
                        <p>Cidade: {endereco.localidade}</p>
                    </div>
                )}
        </>
    )
}