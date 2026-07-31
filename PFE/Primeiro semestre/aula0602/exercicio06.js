const prompt = require("prompt-sync")();
let hoje = new Date();
let fimDoAno = new Date(hoje.getFullYear(), 11, 31); // 31 de dezembro

let diferenca = fimDoAno - hoje;
let diasFaltando = Math.ceil(diferenca / (1000 * 60 * 60 * 24)); //arredonda um número para cima para o inteiro mais próximo

console.log("Faltam", diasFaltando, "dias para o fim do ano");