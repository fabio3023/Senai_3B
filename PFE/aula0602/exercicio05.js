const prompt = require("prompt-sync")();
let anoNascimento = prompt("Informe seu ano de nascimento:");
let anoAtual = new Date().getFullYear();

let idade = anoAtual - anoNascimento;
console.log("Sua idade é:", idade);