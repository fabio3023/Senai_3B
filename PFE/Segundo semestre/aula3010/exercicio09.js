class Pedido {
    numero;
    cliente;
    produto;
    valor;
    status;
    feedback;

    constructor(numero, cliente, produto, valor) {
        this.numero = numero;
        this.cliente = cliente;
        this.produto = produto;
        this.valor = valor;
        this.status = "Em andamento";
    }

    finalizarPedido(feedbackCliente) {
        this.status = "Finalizado";
        this.feedback = feedbackCliente;
        console.log(`Operação: O pedido ${this.numero} foi ${this.status}.`);

        if (this.feedback == "negativo") {
            this.valor = this.valor + (this.valor * (5 / 100));
            console.log(`Feedback negativo. O valor do pedido atualizado é R$ ${this.valor}.`);
        }
    }

    cancelarPedido() {
        this.status = "Cancelado";
        console.log(`Operação: O pedido ${this.numero} foi ${this.status}.`);
    }
}

let pedido1 = new Pedido(101, "João", "Notebook", 3000);
let pedido2 = new Pedido(102, "Maria", "Celular", 1500);

pedido1.finalizarPedido("negativo");
pedido2.cancelarPedido();