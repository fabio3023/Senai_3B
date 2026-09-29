const jogos = ['Minecraft', 'Light', 'Free Fire', 'How to Fish', 'Valorant', 'Pubg'];

function buscaJogo(games, game){
    for(let i = 0; i < games.length; i++){
        if(game == games[i]){
            console.log(`Jogo ${games[i]} encontrado na posição ${i}`);
            return;
        }
    }
    console.log('Jogo inexistente');
}

buscaJogo(jogos, 'Valorant');