// Importa o Express
const express = require("express");

// Importa o Axios(cliente HTTP para consumir APIs externas)
const axios = require("axios");

// Importa o CORS (permite que fronts-ends de outras origens acessem seu back-end)
const cors = require("cors");

// Cria a aplicação Express (o "servidor" em si)
const app = express();

// Middleware global: libera CORS para todas as rotas sem isso o navegador pode bloquear chamadas do Front-end
app.use(cors());

// Middleware global: habilita leitura de JSON no corpo da requisição sem isso, em um post com JSOn, req.body pode vir indefinido
app.use(express.json());

//URL base da API externa
const BASE_URL = "https://jsonplaceholder.org/";

// Rota simples para configurar que o servidor está rodando GET /health -> retornar {ok:true}
app.get("/health", (req,res) => {
    res.json({ok: true});
});

// Rota que lista posts GET /api/posts GET /api/posts?userId=1 (Filtra posts de um usuário)
app.get("/api/posts", async (req,res) => {
    try{
        // Lê o parâmetro da query string (vem como string)
        //Se o usuário chamar /api/posts?userId=1, aqui userId=1
        const {userId} = req.query;

        // Faz requisição para a API (BASE_URL/posts) params adiciona query string automaticamente se userId existir -> params: {userId} se userId não existir -> params:{}
        const responde = await axios.get(`${BASE_URL}/posts`, {
            params: userId ? {userId} : {}
        });

        // retorna 200 OK com um envelope padronizado, source: indice de onde veio, count: quantidade de itens, data: os posts 
        res.status(200).json({
            source: "jsonplaceholder",
            count: response.data.lenght,
            data: response.data
        });
    } catch (err){
        // Se a API externa falhar (sem internet, DNS, timeout, 500 etc)
        res.status(502).json({
            message: "Falha ao consultar a API externa",
            detail: err.menssage
        });
    }
});

/*
GET http://localhost:3000/health
GET http://localhost:3000/api/posts
GET http://localhost:3000/api/posts?userId=1
*/
app.listen(3000, () => console.log(
    "API proxy rodando em http://localhost:3000"
));