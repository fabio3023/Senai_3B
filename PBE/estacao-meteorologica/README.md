# Backend EM — API REST profissional em N-Camadas com PostgreSQL local

API para gerenciar leituras meteorológicas com **Node.js**, **Express**, **PostgreSQL instalado no computador** e **Sequelize**. A arquitetura separa apresentação, aplicação, domínio e infraestrutura, mantendo um fluxo claro para uso em aula.

## O que esta versão utiliza

- PostgreSQL local, executado como serviço do sistema operacional
- Node.js 20 ou superior
- Express e Sequelize
- Migrações SQL versionadas
- DTOs, Services, Entities e Repository Pattern
- Scripts de preparação, inicialização, diagnóstico e finalização
- Nenhuma dependência de virtualização ou gerenciador de contêineres

## Estrutura

```text
backend-base-em-ncamadas-postgresql-local/
├── data/
│   └── em.csv
├── docs/
│   ├── ANALISE_ESTRUTURA_ORIGINAL.md
│   ├── ARQUITETURA.md
│   ├── POSTGRESQL_LOCAL.md
│   └── ROTEIRO_AULA.md
├── scripts/
│   ├── linux/
│   └── windows/
├── src/
│   ├── application/
│   ├── bootstrap/
│   ├── config/
│   ├── domain/
│   ├── infrastructure/
│   ├── presentation/
│   ├── scripts/
│   └── shared/
├── tests/
├── .env.example
├── package.json
├── README.md
└── requests.http
```

## Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL 14 ou superior instalado e configurado no computador
- Senha do usuário PostgreSQL que será usada pela aplicação

## Primeiro uso no Windows

Execute:

```bat
scripts\windows\primeiro_uso.bat
```

Na primeira execução, o script cria o arquivo `.env` e abre o Bloco de Notas. Ajuste principalmente:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=db_em
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_REAL
```

Salve o arquivo e execute `primeiro_uso.bat` novamente. O script:

1. instala as dependências;
2. inicia ou verifica o serviço PostgreSQL;
3. testa as credenciais;
4. cria o banco `db_em`, quando autorizado;
5. aplica as migrações.

## Inicialização diária no Windows

```bat
scripts\windows\db_up.bat
scripts\windows\start.bat
```

O `start.bat` testa a conexão antes de iniciar a API. Para desenvolvimento com reinicialização automática:

```bat
scripts\windows\dev.bat
```

Acesse:

```text
http://localhost:3000
http://localhost:3000/api/v1
http://localhost:3000/api/v1/health/ready
```

## Finalização no Windows

1. Na janela da API, pressione `Ctrl+C`.
2. Normalmente, mantenha o PostgreSQL ligado, pois ele é um serviço local compartilhado.
3. Para realmente parar o serviço, execute:

```bat
scripts\windows\db_down.bat
```

O script pede confirmação porque outros sistemas podem estar usando o mesmo PostgreSQL.

## Comandos npm

```bash
npm install
npm run db:check
npm run db:migrate
npm run db:status
npm run dev
npm start
npm run import:csv
npm run import:csv:clear
npm run reset:leituras
npm run check
npm test
npm run test:api
```

## Scripts Windows

```text
primeiro_uso.bat     prepara o projeto
postgres_service.ps1 localiza e controla o serviço PostgreSQL
db_up.bat            inicia/verifica o PostgreSQL
db_status.bat        mostra o serviço e testa as credenciais
db_down.bat          para o PostgreSQL após confirmação
start.bat            valida o banco e inicia a API
dev.bat              valida o banco e inicia com nodemon
migrate.bat          aplica migrações
import_csv.bat       importa sem limpar
import_csv_limpo.bat limpa e importa
reset_leituras.bat   limpa a tabela
```

## Fluxo em N-Camadas

```text
Cliente
  ↓
Route → Middlewares → Controller
  ↓
DTO → Service
  ↓
Entity + Repository Contract
  ↓
Sequelize Repository → ORM Model → PostgreSQL local
```

## Configuração do banco

| Variável | Exemplo | Finalidade |
|---|---:|---|
| `DB_HOST` | `127.0.0.1` | Endereço do PostgreSQL local |
| `DB_PORT` | `5432` | Porta do servidor |
| `DB_NAME` | `db_em` | Banco da aplicação |
| `DB_MAINTENANCE_NAME` | `postgres` | Banco usado para verificar/criar `db_em` |
| `DB_USER` | `postgres` | Usuário de conexão |
| `DB_PASSWORD` | senha local | Senha definida na instalação |
| `DB_CONNECTION_TIMEOUT_MS` | `5000` | Tempo máximo de conexão |
| `DB_AUTO_CREATE` | `true` | Cria `db_em` automaticamente |
| `DB_RUN_MIGRATIONS` | `true` | Aplica migrações na inicialização |

Quando o usuário não puder criar bancos, crie `db_em` no pgAdmin ou no `psql` e use:

```env
DB_AUTO_CREATE=false
```

## Endpoints

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/` | Entrada da aplicação |
| `GET` | `/api/v1` | Catálogo da API |
| `GET` | `/api/v1/health/live` | Processo HTTP vivo |
| `GET` | `/api/v1/health/ready` | API e banco prontos |
| `GET` | `/api/v1/leituras` | Lista e filtra leituras |
| `GET` | `/api/v1/leituras/:id` | Busca por ID |
| `POST` | `/api/v1/leituras` | Cria leitura |
| `PUT` | `/api/v1/leituras/:id` | Substitui todos os campos |
| `PATCH` | `/api/v1/leituras/:id` | Atualiza campos específicos |
| `DELETE` | `/api/v1/leituras/:id` | Exclui por ID |
| `DELETE` | `/api/v1/leituras` | Limpa a tabela em laboratório |

## Corpo de criação

```json
{
  "station_id": "EM-MIRANDOPOLIS-01",
  "timestamp": "2026-07-30T08:00:00-03:00",
  "temperature_c": 26.7,
  "humidity_pct": 72.4
}
```

## Importação do CSV

```bash
npm run import:csv
npm run import:csv:clear
```

A opção `import:csv:clear` limpa e importa dentro de uma transação.

## Diagnóstico rápido

```bat
scripts\windows\db_status.bat
```

Mensagens mais comuns:

- `ECONNREFUSED`: o serviço está parado, a porta está incorreta ou o PostgreSQL não está ouvindo em `127.0.0.1`.
- código `28P01`: usuário ou senha incorretos.
- código `42501`: usuário sem permissão para criar o banco.
- porta ocupada: confirme em qual porta o PostgreSQL local foi instalado.

Consulte também [docs/POSTGRESQL_LOCAL.md](docs/POSTGRESQL_LOCAL.md).

## Testes

```bash
npm run check
npm test
```

Os testes unitários usam um repositório em memória e não exigem o PostgreSQL. Com a API ligada:

```bash
npm run test:api
```

## Evolução didática

Ao adicionar um novo campo meteorológico, percorra as camadas nesta ordem:

1. Migração SQL
2. ORM Model
3. Entity
4. DTOs
5. Repository
6. Service
7. Controller e Route
8. Testes
9. Documentação e exemplos HTTP
