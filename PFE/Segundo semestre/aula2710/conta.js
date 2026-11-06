class Conta{
    nome;
    #cpf;

    //GET E SET
    setCpf(cpf){
        this.#cpf = cpf;
    }
    getCpf(){
        return this.#cpf;
    }
    mostrar(){
        return `O cliente ${this.nome} tem o cpf ${this.getCpf()}`;
    }
}
let contaPoupanca = new Conta();
contaPoupanca.nome = 'João da Silva';
contaPoupanca.setCpf = ('123.456.789-00');
console.log(contaPoupanca.mostrar());
