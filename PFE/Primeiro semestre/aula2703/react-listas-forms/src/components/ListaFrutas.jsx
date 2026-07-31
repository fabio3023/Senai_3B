const frutas = [
    {nome: "Maça"}, 
    {nome: "Perâ"}, 
    {nome: "Banana"}, 
    {nome: "Manga"}, 
    {nome: "Abacaxi"}
]

export default function ListaMap({titulo}){
    const listaFrutas = frutas.map((frutas) => {
        return <li key={frutas}>
            <h3>{frutas.nome}</h3>
        </li>
    })
    return(
        <>
        <h1>{titulo}</h1>
        <ul>
            {listaFrutas}
        </ul>
        </>
    )
}