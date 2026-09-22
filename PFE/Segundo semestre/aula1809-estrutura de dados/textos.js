const prompt = require('prompt-sync')();

function historicoTextos() {
  const pilha = [];

  return {
    digitar(palavra) {
      pilha.push(palavra);
    },
    desfazer() {
      return pilha.pop();
    },
    obterTexto() {
      return pilha.join(" ");
    }
  };
}

const editor = historicoTextos();

while (true) {
  console.log("\nTexto atual:", editor.obterTexto());
  const entrada = prompt("Digite uma palavra (ou 'desfazer', 'sair'): ");

  if (entrada.toLowerCase() === "sair") {
    break;
  } else if (entrada.toLowerCase() === "desfazer") {
    editor.desfazer();
  } else if (entrada.trim() !== "") {
    editor.digitar(entrada);
  }
}