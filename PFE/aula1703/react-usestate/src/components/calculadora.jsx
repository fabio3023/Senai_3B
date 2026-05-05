import { useState } from "react";

export default function Calculadora(){
    const [n1, setN1] = useState(1);
    const [n2, setN2] = useState(1);
    const [resultado, setResultado] = useState(0);

    function validar(){
        if (Number(n1) <= 0 || Number(n2) <= 0){
            alert("Os números devem ser maiores que zero!");
            return false;
        }
        return true;
    }

    function somar(){
        if (!validar()) return;
        setResultado(Number(n1) + Number(n2));
    }

    function subtrair(){
        if (!validar()) return;
        setResultado(Number(n1) - Number(n2));
    }

    function multiplicar(){
        if (!validar()) return;
        setResultado(Number(n1) * Number(n2));
    }

    function dividir(){
        if (!validar()) return;
        setResultado(Number(n1) / Number(n2));
    }

    function potenciacao(){
        if (!validar()) return;
        setResultado(Number(n1) ** Number(n2));
    }

    function raizQuadrada(){
        if (Number(n1) <= 0){
            alert("O número deve ser maior que zero!");
            return;
        }
        setResultado(Math.sqrt(Number(n1)));
    }

    function limpar(){
        setResultado(0);
        setN1(1);
        setN2(1);
    }

    return(
        <>
        <h1>Calculadora</h1>
        <div>
            <label>Número 1</label>
            <input type="number" min="1"value={n1} onChange={(e) => setN1(e.target.value)}/>

            <label>Número 2</label>
            <input type="number" min="1"value={n2} onChange={(e) => setN2(e.target.value)}/>

            <br /><br />

            <button onClick={somar}>Somar</button>
            <button onClick={subtrair}>Subtrair</button>
            <button onClick={multiplicar}>Multiplicar</button>
            <button onClick={dividir}>Dividir</button>
            <button onClick={raizQuadrada}>Raiz</button>
            <button onClick={potenciacao}>Potência</button>
            <button onClick={limpar}>Limpar</button>

            <br /><br />
            <span>Resultado: {resultado}</span>
        </div>
        </>
    );
}