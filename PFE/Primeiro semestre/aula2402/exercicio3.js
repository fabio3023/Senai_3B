<<<<<<< HEAD
class Bicicleta {
    //encapsulamento
    #cor;
    #modelo;
    #marca;
    #velocidadeMaxima;

    //métodos getters e setters
    setcor(valor){
        this.#cor = valor;
    }
    getCor(){
        return this.#cor;
    }
    setModelo(valor){
        this.#modelo = valor;
    }
    getModelo(){
        return this.#modelo;
    }
    setMarca(valor){
        this.#marca = valor;
    }
    getMarca(){
        return this.#marca;
    }
    setVelocidadeMax(valor){
        if (valor > 35) {
            console.log('Velocidade não permitida');
        }else{
            this.#velocidadeMaxima = valor;
        }
    }
    getVelocidadeMax(){
        return this.#velocidadeMaxima;
    }

}
const bicicreta = new Bicicleta();
bicicreta.setVelocidadeMax(36);
=======
class Bicicleta {
    //encapsulamento
    #cor;
    #modelo;
    #marca;
    #velocidadeMaxima;

    //métodos getters e setters
    setcor(valor){
        this.#cor = valor;
    }
    getCor(){
        return this.#cor;
    }
    setModelo(valor){
        this.#modelo = valor;
    }
    getModelo(){
        return this.#modelo;
    }
    setMarca(valor){
        this.#marca = valor;
    }
    getMarca(){
        return this.#marca;
    }
    setVelocidadeMax(valor){
        if (valor > 35) {
            console.log('Velocidade não permitida');
        }else{
            this.#velocidadeMaxima = valor;
        }
    }
    getVelocidadeMax(){
        return this.#velocidadeMaxima;
    }

}
const bicicreta = new Bicicleta();
bicicreta.setVelocidadeMax(36);
>>>>>>> c24d3ae219d0fc0f1d11a438a0ae5d36d5ed042e
console.log(bicicreta.getVelocidadeMax());