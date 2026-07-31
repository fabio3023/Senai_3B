const prompt = require('prompt-sync')();

// Atividade 1
let nome = 'Pedro';
console.log('Olá,' + nome);

//Atividade 2
let numeroA = 10;
let numeroB = 5;
let soma = numeroA + numeroB;
console.log('A soma dos números é ' + soma);

//Atividade3
let nota1 = Number(prompt('Digite a nota 1: ' ));
let nota2 = Number(prompt('Digite a nota 2: ' ));
let nota3 = Number(prompt('Digite a nota 3: ' ));
let media = (nota1+nota2+nota3) / 3;
console.log('A sua média é: ' + media);

//Atividade 4
let numero = Number(prompt('Digite o seu número: ' ));
if (numero %2 == 0) {
    console.log('O seu número é par ');
}else{
    console.log('O seu número é impar');
}

//Atividade 5
let num1 = Number(prompt('Digite um número: '));
let num2 = Number(prompt('Digite outro número: '));
if (num1 > num2) {
    console.log('O número um é maior ');
}else if (num1 < num2) {
    console.log('O número dois é maior ');
}else if (num1 == 0) {
    console.log('O número um é igual a zero ' );
}else if (num2 == 0) {
    console.log('O número dois é igual a zero ' );
}else if (num1 == num2) {
    console.log('Os dois números digitados são iguais');
}

//Atividade 6
let idade = Number(prompt('Digite a sua idade: ' ));
if (idade < 12) {
    console.log('Você é uma criança');
}else if (idade < 18) {
    console.log('Você é um adolescente');
}else if (idade <= 60) {
    console.log('Você é um adulto');
}else{
    console.log('Você é um idoso');
}

//Atividade 8
let Nota = Number(prompt('Digite sua nota: ' ));
if (Nota >= 90) {
    console.log('Nota A');
}else if (Nota >= 80) {
    console.log('Nota B');
}else if (Nota >= 70) {
    console.log('Nota C');
}else if (Nota >= 60) {
    console.log('Nota D');
}else{
    console.log('Nota F');
}

//Atividade 9
let preco = Number(prompt('Digite o preço de seu produto: '));
let precodesconto;
let precofinal;
console.log('Digite bronze para 5% de desconto');
console.log('Digite prata para 10% de desconto');
console.log('Digite ouro para 15% de desconto');
let desconto = (prompt('Digite seu desconto: ' ));

if (desconto == 'bronze') {
    precodesconto = preco * 0.05;
    precofinal = preco - precodesconto;
    console.log('O preço com desconto foi de R$' + precofinal);

}else if (desconto == 'prata') {
    precodesconto = preco * 0.10;
    precofinal = preco - precodesconto;
    console.log('O preço com desconto foi de R$' + precofinal);

}else if(desconto == 'ouro'){
    precodesconto = preco * 0.15;
    precofinal = preco - precodesconto;
    console.log('O preço com desconto foi de R$' + precofinal);
}

//Atividade 10
let peso = Number(prompt('Digite seu peso em kg: '));
let altura = Number(prompt('Digite sua altura em metros: '));
imc = peso / (altura * 2);
if (imc <= 18.5) {
    console.log('Abaixo do peso ideal, seu imc é: ' + imc);
}else if(imc <= 25){
    console.log('Peso Normal, seu imc é: ' + imc);
}else if (imc <= 30) {
    console.log('Sobrepeso, seu imc é: ' + imc);
}else{
    console.log('Obesidade, seu imc é: ' + imc);
}