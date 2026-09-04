'use client'
import Header from "../components/header"

export default function ListAlunos(){
    return(
        <>
            <Header />
            <h2>Lista de alunos</h2>
            <table>
                <thead>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Idade</th>
                    <th>Série</th>
                    <th>Ra</th>
                    <th>Ações</th>
                </thead>
                <tbody>
                    <tr>
                        <td>01</td>
                        <td>Ana Luisa</td>
                        <td>17</td>
                        <td>3B</td>
                        <td>909030</td>
                        <td><button>Editar</button></td>
                        <td><button>Deletar</button></td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
