const corpo = document.querySelector('body')
const titulo = document.querySelector('.titulo')
const paragrafo = document.querySelector('#texto')
const container = document.querySelector('#container')

corpo.style.backgroundColor = '#9c1291';
corpo.style.color = '#fff';

titulo.textContent = 'Manipulando o Dom de novo!';

let subtitulo = '<h2>Manipular o Dom é moleza!<h2>';
container.innerHTML = subtitulo;