export function createClienteDTO(data) {
    const {nome,email, idade} = data;

    // validações de entrada e formato
    if (typeof nome !== "string" || nome.trim() === ""){
        throw new Error("Campo 'nome' é obrigatório");
    }
    
    /*let a = 10;
    if(a == '10'){
        //verdadeiro
    }

    if (a === '10'){
        // false, pois compar o tipo 
    } */
   
        if (typeof email !== "string" || !email.includes(@)) {
            throw new Error("Campo 'e-mail' inválido!");
        }

        if (typeof idade !== "number" || Number.isNan(idade)) {
            throw new Error("Campo 'idade' deve ser numérico!");
        }
    return {
        nome: nome.trim,
        email : email.trim().toLowerCase(),
        idade
    }
}
    