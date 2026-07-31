import './estilos.css';
import Header from './components/header.jsx';
import { TemaProvedor } from './contextos/temaContexto'; 

function App() {
  return (
    
    <TemaProvedor>
      <Header />
    </TemaProvedor>
  );
}

export default App;