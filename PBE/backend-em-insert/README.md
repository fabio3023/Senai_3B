# Backend EM - Insert

Esta é a segunda parte da aula.

Agora o projeto evolui para:
- subir uma API com Express
- conectar ao PostgreSQL
- criar o banco `db_em`, se não existir
- criar a tabela `leituras`
- inserir alguns dados de exemplo, se a tabela estiver vazia
- disponibilizar a rota `GET /api/leituras` lendo do banco

## Instalação

```bash
npm install
```

## Configuração

Crie o arquivo `.env` com base no `.env.example`.

No Linux:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Execução

```bash
npm start
```

Ou com nodemon:

```bash
npm run dev
```

## Endpoints

- `GET /`
- `GET /api/leituras`

## Observação didática

Nesta etapa ainda **não** há importação do CSV.
O foco é mostrar:
1. conexão com banco
2. criação de tabela via ORM
3. leitura de dados reais pela API
