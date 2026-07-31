const estudantes = [
    {id: 1, nome: 'Roberto Carlos', idade:65, nota: 10, disciplina: 'Ed. Fisica', foto: "https://randomuser.me/api/portraits/men/50.jpg"},
    {id: 2, nome: 'Guilherme', idade:17, nota: 6, disciplina: 'LP', foto: "https://randomuser.me/api/portraits/men/68.jpg"},
    {id: 3, nome: 'Matheus', idade:17, nota: 10, disciplina: 'MAT', foto: "https://randomuser.me/api/portraits/men/67.jpg"},
    {id: 4, nome: 'Pedro', idade:17, nota: 7, disciplina: 'HIS', foto: "https://randomuser.me/api/portraits/men/78.jpg"},
    {id: 5, nome: 'Fábio', idade:17, nota: 4, disciplina: 'BIO', foto: "https://randomuser.me/api/portraits/men/90.jpg"}
]

export default function ListaAlunos({titulo}){
    const lista = estudantes.filter(estudante => estudante.nota >= 6)
    const listaEstudantes = lista.map((estudante) => {
        return <li key={estudante.id}>
            <h3>{estudante.nome}</h3>
            <img src={estudante.foto} />
            <p>{estudante.idade}</p>
            <p>{estudante.nota}</p>
            <p>{estudante.disciplina}</p>
        </li>
    })
    return(
        <>
        <h1>{titulo}</h1>
        <ul>
            {listaEstudantes}
        </ul>
        </>
    )
}