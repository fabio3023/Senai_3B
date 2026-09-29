const alunos = [
    { numero: 4, nome: 'Livia Moraes' },
    { numero: 5, nome: 'Raul Nogueira' },
    { numero: 3, nome: 'Cecilia Barros' },
    { numero: 7, nome: 'Enzo Tavares' },
    { numero: 2, nome: 'Yasmin Duarte' }
];

function ordenaAlunos(alunos){
    let limite = alunos.length - 1;
    let houveTroca = true;
    while(houveTroca){
        houveTroca = false;
        for(let posicao = 0; posicao < limite; posicao++){
            if(alunos[posicao].numero > alunos[posicao + 1].numero){
                [alunos[posicao], alunos[posicao + 1]] = [alunos[posicao + 1], alunos[posicao]];
                houveTroca = true;
            }
        }
        limite--;
    }
    return alunos;
}

console.log(ordenaAlunos(alunos));