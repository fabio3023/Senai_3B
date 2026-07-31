export default function MeuAvatar({ nome, idade, fotodeperfil, estiloMusical, disciplinaFav }){
    return(
        <>
        <h1>{nome}</h1>
        <p>Idade: {idade}</p>
        <img src={fotodeperfil} alt="" />
        <p>{estiloMusical}</p>
        <p>{disciplinaFav}</p>
        </>
    )
}