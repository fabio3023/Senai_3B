const prompt = require("prompt-sync")();

let temCracha = prompt("Você tem crachá? ");
let estaDeUniforme = prompt("Você está de uniforme? ");
let ehMonitor = prompt("Você é monitor? ");
let TemCadastro = prompt("Você tem cadastro? ");

if (temCracha == 'sim' && estaDeUniforme == 'sim' && ehMonitor == 'nao' && TemCadastro == 'sim') {
    console.log("Acesso liberado");
}else if (temCracha == 'sim' && estaDeUniforme == 'sim' && ehMonitor == 'nao' && TemCadastro == 'nao') {
    console.log("Acesso negado");
}else if (temCracha == 'nao' && estaDeUniforme == 'nao' && ehMonitor == 'sim' && TemCadastro == 'sim') {
    console.log("Acesso liberado");
}else if(temCracha == 'nao' && estaDeUniforme == 'nao' && ehMonitor == 'sim' && TemCadastro == 'nao'){
    console.log("Acesso negado");
}