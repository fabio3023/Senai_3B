# Backend EM — API REST em N-Camadas com Node.js, Express, PostgreSQL e Sequelize

Este projeto é um backend didático para trabalhar **API REST**, **PostgreSQL** e **modelo em n-camadas**.

A aplicação usa:

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- DTO
- Repository
- Service
- Controller
- Importação de dados via CSV
- Scripts `.bat` para Windows
- Scripts `.sh` para Linux

O banco utilizado é **db_em** e a tabela principal é **public.leituras**.

---

## 1. O que este projeto faz

Este app disponibiliza uma API para cadastrar, listar, alterar, excluir e importar leituras ambientais.

Cada leitura possui:

| Campo | Exemplo | Descrição |
|---|---:|---|
| `id` | `1` | Código gerado automaticamente pelo banco |
| `station_id` | `EM-ARACATUBA-01` | Identificação da estação |
| `timestamp` | `2026-06-01T08:00:00-03:00` | Data e hora da leitura |
| `temperature_c` | `26.7` | Temperatura em graus Celsius |
| `humidity_pct` | `72.4` | Umidade em percentual |

---

## 2. Rotas principais

Depois que a API estiver rodando, acesse:

```text
http://localhost:3000
```

Essa é a **rota raiz** da aplicação.

Também existe uma rota de resumo da API:

```text
http://localhost:3000/api
```

Principais endpoints:

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/` | Rota raiz da aplicação |
| `GET` | `/api` | Resumo das rotas da API |
| `GET` | `/api/health` | Verificar se a API está ligada |
| `GET` | `/api/leituras` | Listar leituras |
| `GET` | `/api/leituras/:id` | Buscar uma leitura pelo ID |
| `POST` | `/api/leituras` | Criar uma leitura |
| `PUT` | `/api/leituras/:id` | Atualizar uma leitura |
| `DELETE` | `/api/leituras/:id` | Excluir uma leitura |
| `DELETE` | `/api/leituras` | Excluir todas as leituras |

---

## 3. Estrutura do projeto

```text
backend_base_em/
├── data/
│   └── em.csv
├── scripts/
│   ├── linux/
│   └── windows/
├── sql/
│   ├── 01_criar_banco.sql
│   └── 02_criar_tabela.sql
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   └── ensureDatabase.js
│   ├── controllers/
│   │   └── LeituraController.js
│   ├── dtos/
│   │   ├── LeituraRequestDTO.js
│   │   └── LeituraResponseDTO.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── notFoundHandler.js
│   ├── models/
│   │   └── Leitura.js
│   ├── repositories/
│   │   └── LeituraRepository.js
│   ├── routes/
│   │   ├── index.js
│   │   └── leituraRoutes.js
│   ├── scripts/
│   │   ├── importCsv.js
│   │   ├── resetLeituras.js
│   │   └── testApiAxios.js
│   ├── services/
│   │   └── LeituraService.js
│   └── utils/
│       ├── ApiError.js
│       └── parseNumber.js
├── .env.example
├── package.json
├── README.md
└── requests.http
```

---

## 4. Entendendo o modelo em n-camadas

O projeto está separado em camadas para deixar o código mais organizado.

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Rotas | `src/routes` | Define os endereços da API |
| Controller | `src/controllers` | Recebe a requisição HTTP e devolve a resposta |
| DTO | `src/dtos` | Valida e organiza os dados de entrada e saída |
| Service | `src/services` | Contém as regras da aplicação |
| Repository | `src/repositories` | Acessa o banco de dados |
| Model | `src/models` | Representa a tabela no Sequelize |
| Config | `src/config` | Configura conexão e criação do banco |
| Middlewares | `src/middlewares` | Trata erros e rotas inexistentes |

Fluxo de uma requisição:

```text
Cliente -> Route -> Controller -> Service -> Repository -> Model -> PostgreSQL
```

---

## 5. Pré-requisitos

Antes de executar, tenha instalado:

- Node.js
- npm
- PostgreSQL
- DBeaver, Insomnia, Postman ou extensão REST Client do VS Code, se quiser testar visualmente

---

## 6. Configurar o `.env`

Na raiz do projeto, copie o arquivo `.env.example` e crie um arquivo chamado `.env`.

Exemplo de configuração:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_em
DB_MAINTENANCE_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
```

Ajuste `DB_USER` e `DB_PASSWORD` conforme o usuário e senha do seu PostgreSQL.

> O projeto tenta criar o banco `db_em` automaticamente. Para isso, o usuário configurado em `DB_USER` precisa ter permissão para criar banco de dados.

---

## 7. Instalar dependências

Dentro da pasta do projeto, execute:

```bash
npm install
```

No Windows, também é possível usar:

```bat
scripts\windows\install.bat
```

No Linux:

```bash
bash scripts/linux/install.sh
```

---

## 8. Iniciar a API

Modo normal:

```bash
npm start
```

Modo desenvolvimento, reiniciando automaticamente quando houver alteração no código:

```bash
npm run dev
```

No Windows:

```bat
scripts\windows\start.bat
```

ou:

```bat
scripts\windows\dev.bat
```

No Linux:

```bash
bash scripts/linux/start.sh
```

ou:

```bash
bash scripts/linux/dev.sh
```

Ao iniciar, o projeto executa estas etapas automaticamente:

1. Lê as configurações do `.env`.
2. Conecta no banco administrativo `postgres`.
3. Verifica se o banco `db_em` existe.
4. Cria o banco `db_em`, caso ele ainda não exista.
5. Conecta no banco `db_em`.
6. Sincroniza a tabela `leituras` usando o Sequelize.
7. Inicia o servidor Express.

No terminal deverá aparecer algo parecido com:

```text
Verificando se o banco "db_em" existe...
Banco "db_em" já existe.
Conexão com PostgreSQL realizada com sucesso.
Modelos sincronizados com o banco.
API rodando em http://localhost:3000
Rota raiz: http://localhost:3000
Resumo da API: http://localhost:3000/api
Health check: http://localhost:3000/api/health
Leituras: http://localhost:3000/api/leituras
```

---

## 9. Testar a rota raiz

Com a API ligada, abra no navegador:

```text
http://localhost:3000
```

Você deverá receber um JSON parecido com:

```json
{
  "message": "API Backend EM em execução.",
  "description": "API REST didática em Node.js, Express, PostgreSQL e Sequelize.",
  "database": "db_em",
  "mainRoutes": {
    "api": "/api",
    "health": "/api/health",
    "leituras": "/api/leituras"
  }
}
```

Também teste:

```text
http://localhost:3000/api
```

```text
http://localhost:3000/api/health
```

---

## 10. Como popular a tabela com CSV

O projeto já possui um arquivo CSV em:

```text
data/em.csv
```

Esse arquivo pode ser importado para a tabela `public.leituras`.

### Opção recomendada para aula: limpar e importar do zero

Use este comando quando quiser deixar a tabela limpa e popular novamente:

```bash
npm run import:csv:clear
```

No Windows:

```bat
scripts\windows\import_csv_limpo.bat
```

No Linux:

```bash
bash scripts/linux/import_csv_limpo.sh
```

Esse comando faz:

1. Verifica se o banco `db_em` existe.
2. Cria o banco, se necessário.
3. Cria ou sincroniza a tabela `leituras`.
4. Apaga todos os registros da tabela.
5. Reinicia o contador do `id`.
6. Lê o arquivo `data/em.csv`.
7. Insere os dados na tabela.

### Importar sem limpar a tabela

Use este comando quando quiser apenas acrescentar os dados do CSV aos registros já existentes:

```bash
npm run import:csv
```

No Windows:

```bat
scripts\windows\import_csv.bat
```

No Linux:

```bash
bash scripts/linux/import_csv.sh
```

Atenção: se executar várias vezes sem limpar, os registros serão duplicados.

---

## 11. Como popular a tabela manualmente pela API

Com a API ligada, envie um `POST` para:

```http
POST http://localhost:3000/api/leituras
Content-Type: application/json
```

Corpo da requisição:

```json
{
  "station_id": "EM-TESTE-01",
  "timestamp": "2026-06-01T08:00:00-03:00",
  "temperature_c": 26.7,
  "humidity_pct": 72.4
}
```

Também há um arquivo `requests.http` pronto para ser usado no VS Code com a extensão REST Client.

---

## 12. Como popular a tabela manualmente pelo DBeaver ou psql

Conecte-se no banco `db_em` e execute:

```sql
INSERT INTO public.leituras
(station_id, "timestamp", temperature_c, humidity_pct)
VALUES
('EM-TESTE-01', '2026-06-01 08:00:00-03', 26.7, 72.4),
('EM-TESTE-01', '2026-06-01 09:00:00-03', 27.1, 70.5),
('EM-TESTE-02', '2026-06-01 10:00:00-03', 25.9, 75.2);
```

Para conferir:

```sql
SELECT *
FROM public.leituras
ORDER BY id;
```

---

## 13. Consultar os dados

Listar registros pela API:

```http
GET http://localhost:3000/api/leituras
```

Com paginação:

```http
GET http://localhost:3000/api/leituras?page=1&limit=10
```

Filtrar por estação:

```http
GET http://localhost:3000/api/leituras?station_id=EM-ARACATUBA-01
```

Filtrar por data:

```http
GET http://localhost:3000/api/leituras?data_inicio=2026-01-01&data_fim=2026-01-03
```

Buscar por ID:

```http
GET http://localhost:3000/api/leituras/1
```

---

## 14. Limpar a tabela

Pelo npm:

```bash
npm run reset:leituras
```

No Windows:

```bat
scripts\windows\reset_leituras.bat
```

No Linux:

```bash
bash scripts/linux/reset_leituras.sh
```

Pelo SQL:

```sql
TRUNCATE TABLE public.leituras RESTART IDENTITY;
```

---

## 15. Testar com Axios

Com a API ligada, execute:

```bash
npm run test:api
```

Esse script faz testes básicos usando Axios:

1. `GET /api/health`
2. `GET /api/leituras?limit=5`
3. `POST /api/leituras`
4. `GET /api/leituras/:id`

---

## 16. Scripts disponíveis no `package.json`

| Comando | Finalidade |
|---|---|
| `npm start` | Inicia a API em modo normal |
| `npm run dev` | Inicia a API com Nodemon |
| `npm run import:csv` | Importa o CSV sem limpar a tabela |
| `npm run import:csv:clear` | Limpa a tabela e importa o CSV do zero |
| `npm run reset:leituras` | Limpa todos os registros da tabela |
| `npm run test:api` | Executa testes básicos com Axios |

---

## 17. Tabela usada pelo projeto

O Sequelize cria a tabela automaticamente com `sequelize.sync()`, mas a estrutura esperada é:

```sql
CREATE TABLE IF NOT EXISTS public.leituras (
    id serial4 NOT NULL,
    station_id varchar(255) NOT NULL,
    "timestamp" timestamptz NOT NULL,
    temperature_c float8 NOT NULL,
    humidity_pct float8 NOT NULL,
    CONSTRAINT leituras_pkey PRIMARY KEY (id)
);
```

---

## 18. Problemas comuns

### Erro de senha do PostgreSQL

Verifique o arquivo `.env`:

```env
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
```

### Banco não foi criado automaticamente

O usuário do PostgreSQL precisa ter permissão para criar banco de dados.

Em ambiente didático, use normalmente o usuário `postgres`.

### Porta 5432 já está ocupada

Verifique se há outro PostgreSQL rodando na mesma porta.

### Porta 3000 já está ocupada

Altere no `.env`:

```env
PORT=3001
```

Depois acesse:

```text
http://localhost:3001
```

---

## 19. Resumo rápido para executar em aula

Execute em sequência:

```bash
npm install
npm start
npm run import:csv:clear
```

Depois teste no navegador:

```text
http://localhost:3000
http://localhost:3000/api
http://localhost:3000/api/health
http://localhost:3000/api/leituras?page=1&limit=10
```

Se preferir usar dois terminais:

Terminal 1:

```bash
npm start
```

Terminal 2:

```bash
npm run import:csv:clear
```
