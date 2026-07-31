import './App.css';
import Mensagem from './components/mensagem.jsx';
import PropsNomeado from './components/propsNomeado.jsx';
import MeuAvatar from './components/meuAvatar.jsx';
import Foto from './assets/img/Foto.webp';

function App() {
  return (
    <>
    {/* <Mensagem titulo='Aprendendo Props ou Properties ou ainda Propriedades'
     texto='Bem vindo(a) ao mundo do Props' nome='Ana Luiza'/>
     <Mensagem titulo='Interclasse 2026' texto='Bem vindo(a) ao interclasse' nome='Fábio atrasado'/>*/}
    {/*<PropsNomeado titulo='interclasse 2026' texto='Bem vindo(a) ao interclasse' nome='Fábio atrasado' altura={1.68}/>*/}
    <MeuAvatar nome='Pedro' fotodeperfil={Foto} idade={17} estiloMusical='Sertanejo' disciplinaFav='História'/>
    </>
  )
}
export default App
