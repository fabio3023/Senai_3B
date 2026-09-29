const idadeEstudantes = [18, 16, 14, 11, 8, 7, 17];

function ordenaIdades(idades){
    for(let i = 0; i < idades.length; i++){
        for(let j = 0; j < idades.length - 1; j++){
            if(idades[j] > idades[j+1]){
                let temp = idades[j];
                idades[j] = idades[j+1];
                idades[j+1] = temp;
            }
        }
    }
    return idades;
}
console.log('Idades ordenadas', ordenaIdades(idadeEstudantes));