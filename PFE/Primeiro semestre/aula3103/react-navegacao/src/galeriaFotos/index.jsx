import './galeria.css'

export default function Galeria() {
    return (
        <section className="galeria-container">
            <h2>Galeria de Fotos</h2>
            <p>Dê uma olhada no que te espera no Pastelão do Sesi!</p>

            <div className="galeria-grid">
                {/* Substitua os 'src' pelas suas imagens locais no futuro */}
                <img src="https://images.unsplash.com/photo-1599084993091-1cb880721204?q=80&w=600&auto=format&fit=crop" alt="Pastel frito na hora" />
                <img src="https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop" alt="Massa de pastel" />
                <img src="https://images.unsplash.com/photo-1544982503-9f98dd8cb290?q=80&w=600&auto=format&fit=crop" alt="Ingredientes frescos" />
                <img src="https://images.unsplash.com/photo-1614264629471-e9bf8c0df1b8?q=80&w=600&auto=format&fit=crop" alt="Combos de pastel e caldo de cana" />
            </div>
        </section>
    )
}