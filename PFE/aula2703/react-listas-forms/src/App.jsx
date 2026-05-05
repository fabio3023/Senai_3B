import ListaSimples from "./components/listaSimples"
import ListaMap from "./components/listaMap"
import ListaFilter from "./components/listaFilter"
import ListaFrutas from "./components/ListaFrutas"
import ListaAlunos from "./components/ListaAlunos"

function App() {

  return (
    <>
      <ListaFrutas titulo={'Fazendo a lista de frutas'}/>
      <ListaAlunos titulo={'Fazendo a lista de alunos'}/>
    </>
  )
}

export default App