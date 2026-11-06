class Musica {
    titulo;
    artista;
    album;
    duracao;

    constructor(titulo, artista, album, duracao) {
        this.titulo = titulo;
        this.artista = artista;
        this.album = album;
        this.duracao = duracao;
    }

    tocar(nomeDigitado) {
        if (nomeDigitado == this.titulo) {
            console.log(`Reproduzindo a música: ${this.titulo} do artista ${this.artista}.`);
        } else {
            console.log("Música não localizada");
        }
    }
}

let musica1 = new Musica("Bohemian Rhapsody", "Queen", "A Night at the Opera", "5:55");
let musica2 = new Musica("Billie Jean", "Michael Jackson", "Thriller", "4:54");
let musica3 = new Musica("Evidências", "Chitãozinho & Xororó", "Cowboy do Asfalto", "4:59");

musica1.tocar("Bohemian Rhapsody");
musica2.tocar("Thriller");
musica3.tocar("Evidências");