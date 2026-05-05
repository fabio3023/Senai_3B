const estudantes = [
    {id: 1, nome: 'Eleffer', idade:17, ra:189900, disciplina: 'Ed. Fisica'},
    {id: 2, nome: 'Luiz Otávio', idade:17, ra:17700, disciplina: 'LP'},
    {id: 3, nome: 'Maria Eduarda', idade:17, ra:190909, disciplina: 'Ed. Fisica'}
]

export default function ListaFilter({titulo}){
    const lista = estudantes.filter(estudante => estudante.disciplina =='Ed. Fisica')
    const listaEstudantes = lista.map((estudante) => {
        return <li key={estudante.id}>
            <h3>{estudante.nome}</h3>
            <p>{estudante.idade}</p>
            <p>{estudante.ra}</p>
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