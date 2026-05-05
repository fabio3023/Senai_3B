const prompt = require('prompt-sync')();

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

console.log('Digite 1 para soma ');
console.log('Digite 2 para subtrair ');
console.log('Digite 3 para multiplicar ');
console.log('Digite 4 para dividir ');
let operacao = Number(prompt('Digite a operação desejada: ' ))
let num1 = Number(prompt('Digite um número: '))
let num2 = Number(prompt('Digite um número: '))

if (operacao == 1) {
    console.log('A soma do seu cálculo é: ' + soma(num1,num2));
}else if(operacao == 2){
    console.log('A subtração do seu cálculo é: ' + subtracao(num1,num2));
}else if(operacao == 3){
    console.log('A multiplicação do seu cálculo é: ' + multiplicar(num1,num2));
}else if(operacao == 4){
    console.log('A divisão do seu cálculo é: ' + dividir(num1,num2));
}