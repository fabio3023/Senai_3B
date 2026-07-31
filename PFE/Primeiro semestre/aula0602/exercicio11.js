const prompt = require("prompt-sync")();
let palavra = prompt("Digite uma palavra:");

console.log("Primeiras 3 letras:", palavra.substring(0, 3)); //extrair uma parte (uma subcadeia) de uma string de texto maior
console.log("Últimas 3 letras:", palavra.substring(palavra.length - 3));