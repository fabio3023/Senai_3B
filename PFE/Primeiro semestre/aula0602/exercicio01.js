const prompt = require("prompt-sync")();

let pont = Number(prompt("Digite sua pontuação: "));
let result = (pont/2) **2;
console.log(result);