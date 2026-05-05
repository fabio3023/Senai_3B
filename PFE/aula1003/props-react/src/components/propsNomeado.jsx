

export default function PropsNomeado({titulo, texto, nome, altura}){
    return(
        <>
        <h1>{titulo}</h1>
        <p>{texto} <span>{nome}</span></p>
        <p>Altura: {altura} </p>
        </>
    )
}