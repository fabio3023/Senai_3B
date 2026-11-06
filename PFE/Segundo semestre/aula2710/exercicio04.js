class Celular {
    marca;
    modelo;
    cor;
    bateria;
    
  constructor(marca, modelo) {
    this.marca = marca;
    this.modelo = modelo;
    this.ligado = false; 
  }

  ligar() {
    if (this.ligado) {
      console.log(`O ${this.modelo} já está ligado.`);
    } else {
      this.ligado = true;
      console.log(`Iniciando o ${this.modelo}... Tela acesa!`);
    }
  }

  desligar() {
    if (!this.ligado) {
      console.log(`O ${this.modelo} já está desligado.`);
    } else {
      this.ligado = false;
      console.log(`Desligando o ${this.modelo}... Tela apagada!`);
    }
  }
}

const meuCelular = new Celular("Samsung", "Galaxy S23");

meuCelular.ligar();
meuCelular.ligar(); 
meuCelular.desligar(); 
meuCelular.desligar(); 