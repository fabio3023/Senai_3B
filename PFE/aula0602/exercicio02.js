const prompt = require("prompt-sync")();

let idade = Number(prompt("Fale sua idade: "));
if (idade < 16) {
    console.log("Você é menor de idade");
    console.log("Você é um usuário não autorizado a pegar livros, ")
}else if(idade <= 18){
    console.log("Você é menor de idade");
    console.log("Mas é autorizado a pegar livros");
}else {
    console.log("Você é maior de idade");
    console.log("Você é autorizado a pegar livros");
}