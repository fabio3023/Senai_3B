const idades = [20, 17, 18, 19, 16, 11, 14, 13, 12, 15, 10];

function ordenaIdades(idades){
    let limite = idades.length - 1;
    let houveTroca = true;
    while(houveTroca){
        houveTroca = false;
        for(let posicao = 0; posicao < limite; posicao++){
            if(idades[posicao] > idades[posicao + 1]){
                [idades[posicao], idades[posicao + 1]] = [idades[posicao + 1], idades[posicao]];
                houveTroca = true;
            }
        }
        limite--;
    }
    return idades;
}

console.log('Antes:', idades.slice());
console.log('Depois:', ordenaIdades(idades));