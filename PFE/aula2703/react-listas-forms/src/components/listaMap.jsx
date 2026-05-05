const estudantes = [
    {id: 1, nome: 'Eleffer', idade:17, ra:189900},
    {id: 2, nome: 'Luiz Otávio', idade:17, ra:17700},
    {id: 3, nome: 'Maria Eduarda', idade:17, ra:190909}
]

export default function ListaMap({titulo}){
    const listaEstudantes = estudantes.map((estudante) => {
        return <li key={estudante.id}>
            <h3>{estudante.nome}</h3>
            <p>{estudante.idade}</p>
            <p>{estudante.ra}</p>
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