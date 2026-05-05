//Atividade 7
let som = nume1 + nume2;
let sub = nume1 - nume2;
let multi = nume1 * nume2;
let divi = nume1 / nume2;
let nume1 = Number(prompt('Digite um número: '));
let nume2 = Number(prompt('Digite um número: '));
console.log('Digite +, -, / ou * para escolher uma operação.');
let operacao = prompt('Digite a operação desejada: ');
if (operacao == "+") {
    console.log('A operação de soma é ' + som);
}else if (operacao == "-") {
    console.log('A operação de subtração é' + sub);
}else if(operacao == "*"){
    console.log('A operação de multiplicação é' + multi);
}else if(operacao == "/"){
    console.log('A operação de divisão é' + divi);
}