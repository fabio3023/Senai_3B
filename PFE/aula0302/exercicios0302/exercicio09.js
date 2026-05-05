//Atividade 9
const prompt = require('prompt-sync')();

let preco = Number(prompt('Digite o preço de seu produto: '));
let precodesconto;
let precofinal;
let bronze = console.log('Digite bronze para 5% de desconto');
let prata = console.log('Digite prata para 10% de desconto');
let ouro = console.log('Digite ouro para 15% de desconto');
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