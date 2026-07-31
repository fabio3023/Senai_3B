import './produtos.css'

export default function Produtos() {
    return (
        <section className="produtos-container">
            <h2>Nosso Cardápio</h2>
            <p className="descricao-pagina">Confira nossas opções deliciosas feitas com muito carinho!</p>
            
            <div className="produtos-grid">
                <div className="produto-card">
                    <h3>Pastel de Carne</h3>
                    <p>Clássico pastel de carne moída com azeitonas e tempero da casa.</p>
                    <span className="preco">R$ 10,00</span>
                </div>

                <div className="produto-card">
                    <h3>Pastel de Queijo</h3>
                    <p>Muuuito queijo mussarela derretido. O favorito da criançada!</p>
                    <span className="preco">R$ 9,00</span>
                </div>

                <div className="produto-card">
                    <h3>Pastel Frango com Catupiry</h3>
                    <p>Frango desfiado cremoso com o verdadeiro Catupiry.</p>
                    <span className="preco">R$ 12,00</span>
                </div>

                <div className="produto-card">
                    <h3>Pastel Doce: Nutella com Morango</h3>
                    <p>Para adoçar o seu dia, muito recheio de creme de avelã com pedaços de morango.</p>
                    <span className="preco">R$ 15,00</span>
                </div>
            </div>
        </section>
    )
}