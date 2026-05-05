const prompt = require("prompt-sync")();
let numero = prompt("Digite um número decimal:");
let arredondado = Math.round(numero);

console.log("Número arredondado:", arredondado);