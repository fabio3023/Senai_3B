let nome = 'Pedro';

const titulo = document.getElementById('titulo');
const texto = document.getElementById('texto')

corpo.style.backgroundColor = '#f9eb2e';
titulo.style.color = '#09ee4a';
titulo.style.fontSize = '52px';
titulo.style.fontFamily = 'Times New Roman'
titulo.textContent += ', ' + nome;
texto.textContent += ', aprender leva tempo, por isso se esforce, ' + nome + '.';
texto.style.fontSize = '22px'
texto.style.color = '#1d16e8'