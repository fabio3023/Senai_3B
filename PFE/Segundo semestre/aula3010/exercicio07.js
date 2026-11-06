class Semaforo {
    corAtual;

    abrir() {
        this.corAtual = "Verde";
        console.log(`Sinal aberto! A cor do semáforo é ${this.corAtual}.`);
    }

    fechar() {
        this.corAtual = "Vermelho";
        console.log(`Sinal fechado! A cor do semáforo é ${this.corAtual}.`);
    }

    atencao() {
        this.corAtual = "Amarelo";
        console.log(`Atenção! A cor do semáforo é ${this.corAtual}.`);
    }
}

let sinal = new Semaforo();

sinal.abrir();
sinal.atencao();
sinal.fechar();