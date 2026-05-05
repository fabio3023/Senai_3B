import { Link } from 'react-router-dom'
import './principal.css'

export default function Principal(){
    return (
        <div className="container">
            <header>
                <h1>Pastelão do Sesi</h1>
                <nav>
                    <ul>
                        <li>
                            <Link to='/'>Home</Link>
                        </li>
                        <li>
                            <Link to='/sobre'>Sobre</Link>
                        </li>
                        <li>
                            <Link to='/produtos'>Produtos</Link>
                        </li>
                        <li>
                            <Link to='/galeria'>Galeria</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <section className='banner'>
                <img src="https://i.ytimg.com/vi/EI9_LSVIv9Q/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAKVdfl1V594ysgjm-lwxL11MsAIg" alt="Imagem Principal" />
                <div className="texto-banner">
                    <h2>Bem vindo ao pastelão do Sesi</h2>
                    <p>O melhor pastel da região</p>
                </div>
            </section>

            <section className="cards">
                <div>
                    <h3>Pastel com cobertura</h3>
                    <p>Pastelão com recheio de creacheese</p>
                </div>
                <div>
                    <h3>Pastel sem recheio</h3>
                    <p>Pastelão sem recheio, acompanha um copo de água</p>
                </div>
            </section>

            <footer>
                <p>2026 - Todos os direitos reservados - Pastelão do Sesi</p>
            </footer>
        </div>
    )
}