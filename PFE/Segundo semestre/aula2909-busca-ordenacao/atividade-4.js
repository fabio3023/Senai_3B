const contatos = [
    { nome: 'Nina', telefone: '11945671234' },
    { nome: 'Otavio', telefone: '11987654321' }
];

function buscarContato(contatos, nomeProcurado){
    for(const contato of contatos){
        if(contato.nome === nomeProcurado){
            return contato.telefone;
        }
    }
    return 'Contato não encontrado';
}

console.log(buscarContato(contatos, 'Otavio'));
console.log(buscarContato(contatos, 'Helena'));