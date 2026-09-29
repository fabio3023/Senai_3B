const notas = [8, 10, 7, 10, 9, 10, 6];

function contarNotasDez(notas){
    let quantidade = 0;
    for(const nota of notas){
        if(nota === 10){
            quantidade++;
        }
    }
    if(quantidade == 0){
        console.log('Nenhuma nota 10 foi encontrada.');
    }
    return quantidade;
}

console.log('Quantidade de notas 10:', contarNotasDez(notas));