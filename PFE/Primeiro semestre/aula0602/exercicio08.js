const prompt = require("prompt-sync")();
let numeroUsuario = prompt("Digite um número:");
let numeroAleatorio = Math.floor(Math.random() * 10) + 1; //arredonda um número decimal para o inteiro mais próximo para baixo

console.log("Número digitado:", numeroUsuario);
console.log("Número aleatório:", numeroAleatorio);

if (Number(numeroUsuario) === numeroAleatorio) {
    console.log("Os números são iguais!");
} else {
    console.log("Os números são diferentes!");
}