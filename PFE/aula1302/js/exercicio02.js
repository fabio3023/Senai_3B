const titulo = document.querySelector('.titulo');
const container = document.querySelector('#container');
const botao = document.querySelector('.botao');

botao.style.backgroundColor = '#ed0404'

titulo.textContent = 'Sexta-feira de  Carnaval';
titulo.style.color = '#30e6ed';

container.style.backgroundColor = '#a7f486';
container.style.width = '94%';
container.style.margin = '0 auto';
let subtitulo = '<h2>Programação Front-End</h2>'
container.innerHTML += subtitulo;

botao.addEventListener('click', () =>{
    let imagem = '<img src="./img/Mickey_Mouse.png" alt="Imagem de rato">';
    container.innerHTML += imagem;
});