const numeros = [23, 34, 39, 53, 65];

function buscarIndice(array, numero){
    let posicao = 0;
    for(const valor of array){
        if(valor === numero){
            return posicao;
        }
        posicao++;
    }
    return -1;
}

console.log(buscarIndice(numeros, 39));
console.log(buscarIndice(numeros, 100));