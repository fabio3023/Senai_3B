const prompt = require('prompt-sync')();

let num1 = Number(prompt('Digite o número: '))
let num2 = Number(prompt('Digite o segundo número: '))
//Soma
const soma = (num1, num2) => {
    return num1 + num2;
}

//Subtração
const subtracao = (num1, num2) => {
    return num1 - num2;
}

//Multiplicação
const multiplicar = (num1, num2) => {
    return num1 * num2;
}


//Divisão
const dividir = (num1, num2) => {
    return num1 / num2;
}

console.log('A soma dos números é = ' + soma(num1, num2));
console.log('A subtração dos números é = ' + subtracao(num1, num2));
console.log('A multiplicação dos números é = ' + multiplicar(num1, num2));
console.log('A divisão dos números é = ' + dividir(num1, num2));