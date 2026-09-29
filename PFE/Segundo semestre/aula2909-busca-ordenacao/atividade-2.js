const usuarios = ['Livia', 'Raul', 'Cecilia', 'Enzo'];

function buscarNome(nomes, nomeProcurado){
    const nomeFormatado = nomeProcurado.toLowerCase();
    for(const nome of nomes){
        if(nome.toLowerCase() === nomeFormatado){
            return true;
        }
    }
    return false;
}

console.log(buscarNome(usuarios, 'cEcIlIa'));
console.log(buscarNome(usuarios, 'Yasmin'));