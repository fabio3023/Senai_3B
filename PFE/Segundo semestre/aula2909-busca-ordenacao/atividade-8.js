const palavras = ['banana', 'maçã', 'melão', 'melancia', 'abacate'];

function ordenaPalavras(palavras){
    let limite = palavras.length - 1;
    let houveTroca = true;
    while(houveTroca){
        houveTroca = false;
        for(let posicao = 0; posicao < limite; posicao++){
            if(palavras[posicao].length > palavras[posicao + 1].length){
                [palavras[posicao], palavras[posicao + 1]] = [palavras[posicao + 1], palavras[posicao]];
                houveTroca = true;
            }
        }
        limite--;
    }
    return palavras;
}

console.log(ordenaPalavras(palavras));
console.log('Palavras do mesmo tamanho mantêm a ordem em que estavam no array.');