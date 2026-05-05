class Tarefa {
    constructor(titulo, descricao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.concluida = false;
    }

    concluir() {
        this.concluida = true;
    }

    reabrir() {
        this.concluida = false;
    }
}


class ListaTarefas {
    constructor() {
        this.tarefas = [];
    }

    adicionar(tarefa) {
        this.tarefas.push(tarefa);
    }

    removerPorTitulo(titulo) {
        this.tarefas = this.tarefas.filter(t => t.titulo !== titulo);
    }

    listar(concluidas = null) {
        if (concluidas === null) {
            return this.tarefas;
        }
        return this.tarefas.filter(t => t.concluida === concluidas);
    }
}

const t1 = new Tarefa("Estudar JS", "Revisar classes e POO");
const t2 = new Tarefa("Treinar", "Treino de corrida");
const t3 = new Tarefa("Ler livro", "Ler 20 páginas");


const lista = new ListaTarefas();


lista.adicionar(t1);
lista.adicionar(t2);
lista.adicionar(t3);


t1.concluir();


lista.removerPorTitulo("Treinar");


console.log("Todas:");
console.log(lista.listar());


console.log("Concluídas:");
console.log(lista.listar(true));


console.log("Pendentes:");
console.log(lista.listar(false));