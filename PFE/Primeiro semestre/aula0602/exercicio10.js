const prompt = require("prompt-sync")();
let nomeCompleto = prompt("Digite seu nome completo:");

console.log("Maiúsculas:", nomeCompleto.toUpperCase()); //converter todas as letras minúsculas de uma string em letras maiúsculas
console.log("Minúsculas:", nomeCompleto.toLowerCase()); //converter todos os caracteres maiúsculos de uma string em minúsculos