//Primeiro tipo função padrão
function saudacao(nome, sobrenome) {
    console.log('Olá, seja bem vindo ' + nome + sobrenome);
}

saudacao('Pedro', ' Ribeiro'); //Chamada da função

//Segundo tipo - função anônima
const somar = function(num1, num2){
    console.log('A soma das números é ' + (num1 + num2));   
}
somar(25, 35);

//Terceiro tipo - função arrow function
const subtrair = (num3, num4) => {
    console.log('A subtração dos números é ' + (num3 - num4));
}
subtrair(30,50);

//Terceiro tipo - função arrow function(com retorno)
const subtrairComRetorno = (num5, num6) => {
    return num5 - num6;
}
console.log('A subtração com retorno dos números é = ' + subtrairComRetorno(40,50));