const temperaturas = [33, 37, 39, 23, 40, 27, 25];

function ordenaTemperaturas(temperaturas){
    for(let inicio = 0; inicio < temperaturas.length - 1; inicio++){
        let indiceMaisFrio = inicio;
        for(let posicao = inicio + 1; posicao < temperaturas.length; posicao++){
            if(temperaturas[posicao] < temperaturas[indiceMaisFrio]){
                indiceMaisFrio = posicao;
            }
        }
        if(indiceMaisFrio !== inicio){
            [temperaturas[inicio], temperaturas[indiceMaisFrio]] = [temperaturas[indiceMaisFrio], temperaturas[inicio]];
        }
    }
    return temperaturas;
}

console.log(ordenaTemperaturas(temperaturas));