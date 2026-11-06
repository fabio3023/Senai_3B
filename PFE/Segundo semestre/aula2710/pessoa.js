class Pessoa {
    nome;
    idade;
    altura;
    renda;

    constructor(nome, idade, altura, renda){
        this.nome = nome;
        this.idade = idade;
        this.altura = altura;
        this.renda = renda;
    }
}

let cidadao = new Pessoa('Maria Eduarda', 18, 1.80, 20000);
console.log(cidadao);