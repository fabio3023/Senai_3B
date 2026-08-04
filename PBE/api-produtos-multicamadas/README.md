# API de Produtos Multicamadas

Projeto completo de uma API REST para gerenciamento de produtos, desenvolvido com **Node.js**, **Express**, **Sequelize** e **PostgreSQL**.

A aplicação usa JavaScript CommonJS e uma arquitetura em múltiplas camadas, adequada tanto para estudo quanto para evolução de um projeto real.

## Recursos implementados

- CRUD completo: criar, listar, buscar, substituir, atualizar parcialmente e excluir.
- PostgreSQL com criação automática do banco `db_products`.
- Criação automática da tabela `products` pelo Sequelize.
- Arquitetura separada em domínio, aplicação, infraestrutura e apresentação.
- DTOs para entrada e saída de dados.
- Repository Pattern e injeção manual de dependências.
- Validação com Zod.
- Paginação, filtros e ordenação.
- Tratamento centralizado de erros.
- Proteções HTTP com Helmet e suporte a CORS.
- Health check da API e do PostgreSQL.
- Seed inicial, reset didático, testes unitários e documentação OpenAPI.
- Scripts para Windows, Linux e Git Bash.

## Estrutura de pastas

```text
api-produtos-multicamadas/
├── docs/
│   ├── ARCHITECTURE.md
│   └── openapi.yaml
├── scripts/
│   ├── check-project.js
│   ├── install.bat
│   ├── install.sh
│   ├── start.bat
│   ├── start.sh
│   ├── start-dev.bat
│   ├── start-dev.sh
│   ├── test.bat
│   └── test.sh
├── src/
│   ├── application/
│   │   ├── dtos/
│   │   └── services/
│   ├── bootstrap/
│   ├── config/
│   ├── domain/
│   │   ├── entities/
│   │   └── repositories/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── models/
│   │   └── repositories/
│   ├── presentation/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── validators/
│   ├── shared/
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
├── package.json
├── requests.http
└── README.md
```

## Fluxo de uma requisição

```text
Rota
  -> Validador
    -> Controller
      -> Service
        -> Repository
          -> Sequelize
            -> PostgreSQL
```

A explicação detalhada está em `docs/ARCHITECTURE.md`.

## Pré-requisitos

- Node.js 18 ou superior.
- PostgreSQL instalado e em execução.
- Um usuário PostgreSQL com senha válida.
- Para a criação automática do banco, o usuário deve ter permissão `CREATEDB`.

Não é necessário criar manualmente o banco ou a tabela.

## Instalação rápida no Windows

1. Extraia o projeto.
2. Abra a pasta no VS Code.
3. Execute:

```bat
scripts\install.bat
```

4. Abra o arquivo `.env` criado pelo script e informe a senha correta do PostgreSQL:

```env
DB_USER=postgres
DB_PASSWORD=SUA_SENHA
```

5. Inicie em modo de desenvolvimento:

```bat
scripts\start-dev.bat
```

## Instalação pelo terminal

```bash
cp .env.example .env
npm install
npm run dev
```

No PowerShell, use:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## Configuração do `.env`

```env
APP_PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=db_products
DB_USER=postgres
DB_PASSWORD=postgres
DB_MAINTENANCE_NAME=postgres
DB_LOGGING=false
```

`DB_MAINTENANCE_NAME` é o banco usado apenas para conectar ao servidor PostgreSQL e criar `DB_NAME` quando ele ainda não existe.

## Inicialização

Modo de desenvolvimento, com reinicialização automática:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Ao iniciar, a aplicação:

1. conecta ao banco de manutenção;
2. verifica se `db_products` existe;
3. cria o banco quando necessário;
4. conecta o Sequelize;
5. cria a tabela `products` quando necessário;
6. abre a API na porta 3000.

Para finalizar, pressione `Ctrl+C`. A conexão HTTP e o Sequelize serão encerrados de forma controlada.

## Endereços principais

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Produtos: `http://localhost:3000/api/products`

## Modelo de produto

| Campo | Tipo | Regras |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `sku` | texto | Obrigatório e único |
| `name` | texto | Obrigatório, até 150 caracteres |
| `description` | texto | Opcional |
| `price` | decimal | Obrigatório e maior ou igual a zero |
| `stock` | inteiro | Maior ou igual a zero |
| `active` | booleano | Padrão `true` |
| `createdAt` | data/hora | Gerado automaticamente |
| `updatedAt` | data/hora | Atualizado automaticamente |

## Endpoints do CRUD

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/products` | Criar produto |
| `GET` | `/api/products` | Listar, filtrar e paginar |
| `GET` | `/api/products/:id` | Buscar por ID |
| `PUT` | `/api/products/:id` | Substituir todos os dados editáveis |
| `PATCH` | `/api/products/:id` | Atualizar alguns campos |
| `DELETE` | `/api/products/:id` | Excluir produto |

## Criar um produto

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "sku": "MON-001",
  "name": "Monitor 24 polegadas",
  "description": "Monitor IPS Full HD",
  "price": 899.90,
  "stock": 15,
  "active": true
}
```

Resposta esperada: `201 Created`.

## Listagem, paginação e filtros

```http
GET /api/products?page=1&limit=10
```

Filtros disponíveis:

- `name`
- `sku`
- `active=true` ou `active=false`
- `minPrice`
- `maxPrice`
- `sortBy=name|sku|price|stock|active|createdAt|updatedAt`
- `order=ASC|DESC`

Exemplo:

```http
GET /api/products?name=monitor&active=true&minPrice=500&maxPrice=2000&sortBy=price&order=ASC
```

## Resposta padronizada de sucesso

```json
{
  "success": true,
  "data": {
    "id": "1cbd149a-1f58-4d2e-b233-98601bbed86e",
    "sku": "MON-001",
    "name": "Monitor 24 polegadas",
    "description": "Monitor IPS Full HD",
    "price": 899.9,
    "stock": 15,
    "active": true,
    "createdAt": "2026-08-03T12:00:00.000Z",
    "updatedAt": "2026-08-03T12:00:00.000Z"
  }
}
```

## Resposta padronizada de erro

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Dados da requisição inválidos.",
    "details": [
      {
        "field": "price",
        "message": "Too small: expected number to be >=0"
      }
    ]
  }
}
```

## Carga inicial

Para inserir três produtos de exemplo:

```bash
npm run seed
```

O comando pode ser executado mais de uma vez porque SKUs duplicados são ignorados.

## Reset do banco didático

```bash
npm run db:reset
```

Esse comando recria as tabelas e remove os dados existentes. Use apenas em desenvolvimento ou aula.

## Testes

Os testes do serviço usam o executor nativo do Node.js e um repositório em memória:

```bash
npm test
```

## Verificação estrutural e sintática

```bash
npm run check
```

O script confirma a presença dos arquivos essenciais e executa `node --check` em todos os arquivos JavaScript.

## Testar pelo VS Code

Abra `requests.http` com a extensão REST Client. Execute primeiro a criação de produto, copie o UUID retornado para `@productId` e depois execute as demais operações.

## Testar com curl

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"CABO-001","name":"Cabo USB-C","price":39.90,"stock":30,"active":true}'
```

```bash
curl http://localhost:3000/api/products
```

## Códigos HTTP usados

- `200 OK`: consulta ou atualização concluída.
- `201 Created`: produto criado.
- `204 No Content`: produto excluído.
- `400 Bad Request`: entrada inválida.
- `404 Not Found`: produto ou rota inexistente.
- `409 Conflict`: SKU duplicado.
- `500 Internal Server Error`: erro inesperado.
- `503 Service Unavailable`: health check sem conexão com o banco.

## Solução de problemas

### Erro `28P01`

Usuário ou senha do PostgreSQL incorretos. Corrija `DB_USER` e `DB_PASSWORD` no `.env`.

### Erro `ECONNREFUSED`

O serviço PostgreSQL não está iniciado ou está em outra porta. Verifique `DB_HOST` e `DB_PORT`.

### Erro ao criar o banco

O usuário não possui permissão `CREATEDB`. Um administrador pode concedê-la com:

```sql
ALTER USER postgres CREATEDB;
```

Também é possível criar `db_products` manualmente e manter o mesmo nome no `.env`.

### Porta 3000 ocupada

Altere:

```env
APP_PORT=3001
```

## Documentação OpenAPI

A especificação está em `docs/openapi.yaml` e pode ser aberta em editores compatíveis com OpenAPI 3.

## Próximas evoluções naturais

- autenticação e autorização;
- categorias e fornecedores;
- movimentações de estoque;
- soft delete e auditoria;
- testes de integração HTTP;
- migrations para ambientes produtivos;
- containerização e implantação em nuvem.
