class Bairro {
    nome;
    qtde_habitantes;
    qtde_casas;
    faixa_etaria;
    media_renda_familiar;

    mostrar() {
        console.log(`O nome do Bairro é ${this.nome} e a quantidade de habitantes é ${this.qtde_habitantes} e a quantidade de casas é ${this.qtde_casas} e a faixa etaria é ${this.faixa_etaria} e a media da renda familia é ${this.media_renda_familiar}`);
    }
}

let Centro = new Bairro();
Centro.nome = "Centro";
Centro.qtde_habitantes = 15000;
Centro.qtde_casas = 4500;
Centro.faixa_etaria = "18 a 60 anos";
Centro.media_renda_familiar = 3500.00;

Centro.mostrar();