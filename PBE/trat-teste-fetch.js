async function main() {
    try {
        const resp = await fetch("http://localhost:3001/api/posts",{
            signal: AbortSignal.timeout(5000) // 5 segundos
        });

        if (!resp.ok){
            // Se falhar ao ler, usa uma string vazia
            const body = await resp.text().catch(() => "");

            //monta uma resposta adequada
            //lança uma exception que será captada por catch
            throw new error (`HTTP ${resp.status} ${resp.statusText} | ${body}`);
        }

        // converte o corpo da resposta para o formato json
        const json = await resp.json();

        console.log("Count: ", json.data.posts.length);
    } catch (erro) {
        //por enquanto não escreverei nada por aqui
}
}
 
main();