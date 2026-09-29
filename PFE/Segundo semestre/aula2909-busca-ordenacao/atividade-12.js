const salarios = [10000, 6000, 19000, 4000, 3000];

function ordenaSalarios(salarios){
    for(let inicio = 0; inicio < salarios.length - 1; inicio++){
        let indiceMaior = inicio;
        for(let posicao = inicio + 1; posicao < salarios.length; posicao++){
            if(salarios[posicao] > salarios[indiceMaior]){
                indiceMaior = posicao;
            }
        }
        if(indiceMaior !== inicio){
            [salarios[inicio], salarios[indiceMaior]] = [salarios[indiceMaior], salarios[inicio]];
        }
    }
    return salarios;
}

console.log(ordenaSalarios(salarios));