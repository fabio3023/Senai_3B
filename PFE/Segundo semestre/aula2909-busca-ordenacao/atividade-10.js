const numeros = [8, 3, 5, 1, 9, 2];

function ordenarContandoTrocas(numeros){
    let trocas = 0;
    let limite = numeros.length - 1;
    let houveTroca = true;
    while(houveTroca){
        houveTroca = false;
        for(let posicao = 0; posicao < limite; posicao++){
            if(numeros[posicao] > numeros[posicao + 1]){
                [numeros[posicao], numeros[posicao + 1]] = [numeros[posicao + 1], numeros[posicao]];
                trocas++;
                houveTroca = true;
            }
        }
        limite--;
    }
    return { numeros: numeros, trocas: trocas };
}

const resultado = ordenarContandoTrocas(numeros);
console.log('Array ordenado:', resultado.numeros);
console.log('Total de trocas:', resultado.trocas);