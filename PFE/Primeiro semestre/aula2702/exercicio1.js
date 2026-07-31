class Produto {
    nome;
    preco;
    estoque;

    constructor(nome, preco, estoque){
        if (preco >= 0 && estoque >= 0) {
            this.nome = nome;
            this.preco = preco;
            this.estoque = estoque;
        } else {
            console.log("Erro: preço e estoque não podem ser negativos");
        }
    }

    aplicarDesconto(percentual){
        this.preco = this.preco - (this.preco * percentual / 100);
    }

    valorEstoque(){
        return this.preco * this.estoque;
    }
}

const hotwhells = new Produto('nome', 18, 21);
aplicarDesconto(hotwhells);
const nerf = new Produto('nerf', 17, 23);