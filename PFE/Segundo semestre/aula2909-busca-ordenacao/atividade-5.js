const produtos = [
    { nomeProduto: 'Arroz', preco: 25.90 },
    { nomeProduto: 'Leite', preco: 6.50 },
    { nomeProduto: 'Cafe', preco: 18.90 }
];

function buscarProdutoBarato(produtos){
    for(const produto of produtos){
        if(produto.preco < 20){
            return produto.nomeProduto;
        }
    }
    return null;
}

console.log(buscarProdutoBarato(produtos));
console.log(buscarProdutoBarato([
    { nomeProduto: 'Queijo', preco: 28.50 },
    { nomeProduto: 'Azeite', preco: 32.00 }
]));