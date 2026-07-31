const titulo = document.querySelector('.titulo');
const container = document.querySelector('#container');
const botao = document.querySelector('.botao');

titulo.textContent = 'Sexta-feira de  Carnaval'

container.style.backgroundColor = '#78ef45'
container.style.width = '94%';
container.style.margin = '0 auto';
let subtitulo = '<h2>Programação Front-End</h2>'
container.innerHTML += subtitulo;
let imagem = '<img src="./img/Mickey_Mouse.png" alt="Imagem de rato">';
container.innerHTML += imagem;

let contador = 0;
botao.addEventListener('click', () =>{
    alert('Você clicou no botão ' + contador + ' vezes');
    contador ++;
});