import {Routes, Route} from 'react-router-dom'

//importar páginas
import Principal from '../pages/principal';
import Sobre from '../sobre'
import Galeria from '../galeriaFotos';
import Produtos from '../produtos';
export default function Rotas(){
    return(
<Routes>
    <Route path='/' element={<Principal/>} />
    <Route path='/sobre' element={<Sobre/>} />
    <Route path='/galeria' element={<Galeria/>} />
    <Route path='/produtos' element={<Produtos/>} />
</Routes>
    )
}
