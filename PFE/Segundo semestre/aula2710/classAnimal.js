class Animal{
    classificacao;
    especie;
    tamanho;
    nomeCientifico;

    alimentar(qtde){
        console.log(`Animal alimentado com ${qtde} kilos.`)
    }
    classificar(classe){
        this.classificacao = classe;
    }
}

let cachorro = new Animal();
cachorro.classificar ('quadrupede');
cachorro.especie = 'Vira-lata';
cachorro.tamanho = 'Pequena';
cachorro.nomeCientifico = 'Viralatus Caramelus'
cachorro.alimentar('500 gramas');

console.log(cachorro);
