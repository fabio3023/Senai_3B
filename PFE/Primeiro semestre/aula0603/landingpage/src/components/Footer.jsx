

export default function Footer(){
    return(
        <p>
            <script>
                const data_atual = new Date();
                document.write(data_atual.getFullYear())
            </script>
            Academia Fofitness. Todos os direitos reservados.
        </p>       
    )
}