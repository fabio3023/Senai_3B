const paises = ['Uzbequistão', 'Groelandia', 'Paquistão', 'Angola', 'Bahrein', 'Cabo Verde', 'França', 'Islândia', 'Honduras'];

function buscaPais(countries, country){
    for(let i = 0; i < countries.length; i++){
        if(country == countries[i]){
            console.log(`País ${countries[i]} encontrado na posição ${i}`);
            return;
        }
    }
    console.log('País inexistente');
}

buscaPais(paises, 'Islândia');