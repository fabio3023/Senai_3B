class TimeFutebol {
    nome;
    cidade;
    quantidadeJogadores;
    quantidadeTitulos;

    constructor(nome, cidade, quantidadeJogadores, quantidadeTitulos) {
        this.nome = nome;
        this.cidade = cidade;
        this.quantidadeJogadores = quantidadeJogadores;
        this.quantidadeTitulos = quantidadeTitulos;
    }

    mostrarInformacoes() {
        console.log(`O time ${this.nome} de ${this.cidade} possui ${this.quantidadeTitulos} títulos.`);
        
        if (this.quantidadeJogadores > 11) {
            console.log("Tem um jogador a mais.");
        } else if (this.quantidadeJogadores < 11) {
            console.log("Está faltando jogadores.");
        } else {
            console.log("Time pode jogar.");
        }
    }
}

let time1 = new TimeFutebol("Vasco", "Rio de Janeiro", 11, 24);
let time2 = new TimeFutebol("São Paulo", "São Paulo", 10, 22);

time1.mostrarInformacoes();
time2.mostrarInformacoes();