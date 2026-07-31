class Animal{
    especie;
    #genero;
    #qtdeIndividuos;
    #nome;

    constructor(especie, genero, qtde, nome){
        this.especie = especie;
        this.#genero = genero;
        this.#qtdeIndividuos = qtde;
        this.#nome = nome;
    }

    //método mostrar
    mostrar() {
        console.log("espécie: ", this.especie);
        console.log("genero: ", this.#genero);
        console.log("qtdeIndividuos: ", this.#qtdeIndividuos);
        console.log("nome: ", this.#nome);
    }
}

const panda = new Animal('urso', 'femêa', 2, 'Peppa e Pig');
panda.mostrar();