class Caneta{
    cor = 'amarela';
    marca = 'Faber Castel';
    ponta = 'Fina';
    qtdTinta = 10;//ml
    tampa = false;

    escrever(){
        this.qtdTinta -= 1; 
        return 'Comecei a escrever';
    }
    //Criar um método sublinhar, que recebe um parâmetro 
    //valor que vai representar a quantidade gasta de tinta ao sublinhar, desconte da quantidade gasta de tinta e mostre qtd restante, 
    //porém não permita que seja subtraido se o valor for maior que a quantidade de tinta da classe
    sublinhar(valor){
        if (valor > this.qtdTinta) {
            return 'Quantidade de tinta insuficiente'
        }
        this.qtdTinta -= valor;
        return ' A quantidade restante depois de sublinhar é ' + this.qtdTinta
    }
    //criar método recarregar que recebe um valor e soma esse valor a quantidade de tinta da classe,
    //considerando que a qtd de tinta não pode ser maior que 15ml
    recarregar(valor2){
        if (this.qtdTinta + valor2 <= 15) {
            this.qtdTinta += valor2;
            return 'A quantidade recarregada é ' + this.qtdTinta;
        }
        return 'A quantidade não pode ultrapassar 15ml'
    }

    getQtdTinta(){
        return this.qtdTinta;
    }
}

const canetaFina = new Caneta();
//canetaFina.escrever();
//canetaFina.escrever();
//console.log('A quantidade restante de tinta é ' +  canetaFina.getQtdTinta());

// console.log(canetaFina.sublinhar(10))
console.log(canetaFina.recarregar(4));