# PostgreSQL local — instalação lógica e operação do projeto

## 1. O que muda nesta versão

O PostgreSQL roda diretamente no computador como serviço do sistema operacional. A API se conecta a `127.0.0.1:5432`. Não existe uma camada intermediária para iniciar o banco nem volume separado: os dados ficam no diretório de dados da instalação local do PostgreSQL.

## 2. Arquivo `.env`

Crie o arquivo a partir do modelo:

### Windows

```bat
copy .env.example .env
notepad .env
```

### Linux

```bash
cp .env.example .env
nano .env
```

Informe a senha real do usuário configurado no PostgreSQL:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=db_em
DB_MAINTENANCE_NAME=postgres
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_REAL
DB_AUTO_CREATE=true
DB_RUN_MIGRATIONS=true
```

## 3. Criação do banco

Com `DB_AUTO_CREATE=true`, a própria aplicação conecta ao banco administrativo `postgres`, verifica se `db_em` existe e o cria quando necessário.

Essa operação exige que `DB_USER` tenha permissão `CREATEDB`. Quando isso não for permitido, crie o banco manualmente:

```sql
CREATE DATABASE db_em;
```

Depois altere:

```env
DB_AUTO_CREATE=false
```

## 4. Sequência recomendada no Windows

### Primeiro uso

```bat
scripts\windows\primeiro_uso.bat
```

### Uso diário

```bat
scripts\windows\db_up.bat
scripts\windows\start.bat
```

### Finalização

- Pressione `Ctrl+C` na janela da API.
- Deixe o serviço PostgreSQL funcionando, salvo quando houver uma razão para desligá-lo.
- Para parar conscientemente o serviço:

```bat
scripts\windows\db_down.bat
```

## 5. Sequência manual equivalente

```bat
npm install
npm run db:check
npm run db:migrate
npm start
```

Como `DB_RUN_MIGRATIONS=true`, `npm start` também executa as migrações pendentes. O comando explícito `db:migrate` é mantido para fins didáticos e administrativos.

## 6. Verificação no pgAdmin

No servidor local, procure:

```text
Servers
└── PostgreSQL
    └── Databases
        └── db_em
            └── Schemas
                └── public
                    └── Tables
                        ├── leituras
                        └── schema_migrations
```

Consulta útil:

```sql
SELECT COUNT(*) AS total FROM public.leituras;
SELECT * FROM public.schema_migrations ORDER BY filename;
SELECT * FROM public.leituras ORDER BY timestamp DESC LIMIT 20;
```

## 7. Diagnóstico de conexão

Execute:

```bat
scripts\windows\db_status.bat
```

Ou diretamente:

```bash
npm run db:check
```

### Serviço parado

Mensagem típica: `ECONNREFUSED`.

Ação: execute `db_up.bat` ou abra `services.msc`, localize o serviço PostgreSQL e inicie-o.

### Senha incorreta

Código típico: `28P01`.

Ação: corrija `DB_USER` e `DB_PASSWORD` no `.env`.

### Banco não pode ser criado

Código típico: `42501`.

Ação: conceda permissão de criação ao usuário ou crie `db_em` manualmente e use `DB_AUTO_CREATE=false`.

### Porta diferente de 5432

Confira a porta configurada no servidor local e altere `DB_PORT`.

## 8. Cuidado ao parar o PostgreSQL

Ao contrário de um banco isolado, o PostgreSQL local pode atender várias aplicações. Parar o serviço encerra a disponibilidade do banco para todas elas. Por isso, o encerramento normal deste projeto é apenas `Ctrl+C` na API.
