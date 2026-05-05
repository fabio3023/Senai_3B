//f1 carregar dependências(módulos do projeto)------------------------------
//Express: cria servidor e rotas
const express = require("express");
//Axios: faz requisições HTTP para APIs externas
const axios = require("axios");
//CORS: libera o front-end(outras origens) acessarem este back-end
const cors = require("cors");
//--------------------------------------------------------------------------

//f2 criar a aplicação(intância do servidor)
const app = express();

//f3 configurar midllewares globais(valem para toda a aplicação)
//Habilitar Cors(evitar bloqueios do navegador por Same-Origin Policy)
app.use(cors());
//Habilitar JSON no body (permitir ler req.body em requisições com JSON)
app.use(express.json());


//f4 definir configurações/constantes do projeto
//BASE_URL = endereço da API externa que o servidor irá "proxiar"
const BASE_URL= "https://dummyjson.com";
//--------------------------------------------------------------------------

//f5 rotas básicas(raíz e status)
//Rota de status(healthcheck)
//Objetivo: teste rápido para saber se a instância do servidor está ok
//HTTP GET /health -> { ok: true}
app.get("/health", (req, res) => {
    res.json({ ok:true})
});
//Rota raíz(home)
//objetivo:mensagem amigável + lista das rotas disponíveis
app.get("/", (req,res) => {
    res.status(200).send(`
        <h1>Minha API está no ar \u2705</h1>
        <p>Rotas disponíveis</p>
        <ul>
            <li><a href="/health">/health</a></li>
            <li><a href="/api/posts">/api/posts</a></li>
        </ul>
        `);
});
//--------------------------------------------------------------------------


//f6 Rota principal (proxy de posts)
//f6.1 Receber requisição do cliente
//GET /api/posts -> busca posts na api en=xterna e devolve em formato padronizado
app.get("/api/posts", async (req, res) => {
    try{
        //f6.2 consumir API externa (chama BASe_URL/posts)
        const response =await axios.get(`${BASE_URL}/posts`);

        //f6.3 Montar resposta de sucesso(envelope padronizado)
        //source: identifica a origem de dados
        //count:quantidade de itens recebidos
        //data:lista de posts
        res.status(200).json({
            source: "dummyjson",
            count: response.data.lenght,
            data: response.data
        })
    }catch (err){
    //f6.4 tratamento de falha ao cunsultar a API externa      
    // 502 bad gateway = "Meu servidor não conseguiu obter uma resposta válida!"
        res.status(502).json({
            message:"Falha ao cunsultar API externa",
            detail: err.message
        });
    }
});

//f7 Iniciar servidor (listen)
//Sobre o servidor na porta 3000 e impreme uma mensagem no terminal
app.listen(3001, () => console.log("API proxy rodando em http://localhost:3001"));
