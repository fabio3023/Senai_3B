class Pessoa {
    nome;
    idade;
    profissao;
    cidade;
    renda;

    constructor(nome, idade, profissao, cidade, renda) {
        this.nome = nome;
        this.idade = idade;
        this.profissao = profissao;
        this.cidade = cidade;
        this.renda = renda;
    }

    apresentar() {
        if (this.idade > 60) {
            this.renda = this.renda + (this.renda * (5 / 100));
        }
        console.log(`Meu nome é ${this.nome}, tenho ${this.idade} anos, sou ${this.profissao}, moro em ${this.cidade} e minha renda é de R$ ${this.renda}.`);
    }
}

let pessoa1 = new Pessoa("Carlos", 65, "Aposentado", "São Paulo", 3000);
let pessoa2 = new Pessoa("Ana", 28, "Engenheira", "Rio de Janeiro", 7500);
let pessoa3 = new Pessoa("Roberto", 62, "Professor", "Curitiba", 4000);

pessoa1.apresentar();
pessoa2.apresentar();
pessoa3.apresentar();