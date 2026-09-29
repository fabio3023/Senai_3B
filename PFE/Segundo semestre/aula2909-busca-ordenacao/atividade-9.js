const carros = [
    { modelo: 'Aurora', anoFabricacao: 2018 },
    { modelo: 'Ventura', anoFabricacao: 2005 },
    { modelo: 'Horizonte', anoFabricacao: 2012 },
    { modelo: 'Brisa', anoFabricacao: 1999 }
];

function ordenaCarros(carros){
    let limite = carros.length - 1;
    let houveTroca = true;
    while(houveTroca){
        houveTroca = false;
        for(let posicao = 0; posicao < limite; posicao++){
            if(carros[posicao].anoFabricacao > carros[posicao + 1].anoFabricacao){
                [carros[posicao], carros[posicao + 1]] = [carros[posicao + 1], carros[posicao]];
                houveTroca = true;
            }
        }
        limite--;
    }
    return carros;
}

console.log(ordenaCarros(carros));