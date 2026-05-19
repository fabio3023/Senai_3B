# backend-em-insert — Aplicativo completo

## Descrição

Este projeto é uma API Back-end para leitura de dados de uma estação meteorológica.

Ele usa:

```text
Node.js
Express
Sequelize
PostgreSQL
CSV
Git/GitHub
```

A aplicação possui:

```text
Rota raiz com descrição da API
Rota para listar todas as leituras
Rota para pesquisar leituras por data
Seed inicial de dados
Importação de leituras por CSV
Criação automática do banco db_em, caso ele não exista
```

---

## Estrutura do projeto

```text
backend-em-insert
├── data
│   └── leituras.csv
├── src
│   ├── config
│   │   ├── database.js
│   │   └── ensureDatabase.js
│   ├── models
│   │   └── Leitura.js
│   ├── routes
│   │   └── leiturasRoutes.js
│   ├── scripts
│   │   ├── criarBanco.js
│   │   └── importarLeiturasCsv.js
│   ├── seeders
│   │   └── seedLeiturasIfEmpty.js
│   └── server.js
├── .env-exemplo
├── .gitignore
├── package.json
└── README.md
```

---

## 1. Instalar dependências

Dentro da pasta do projeto, execute:

```bash
npm install
```

---

## 2. Criar o arquivo .env

Copie o arquivo de exemplo:

```bash
cp .env-exemplo .env
```

No Windows PowerShell, se necessário:

```powershell
Copy-Item .env-exemplo .env
```

Confira o conteúdo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_em
DB_USER=postgres
DB_PASSWORD=admin
```

Ajuste `DB_PASSWORD` de acordo com a senha do PostgreSQL da sua máquina.

Atenção: o arquivo `.env` não deve ser enviado para o GitHub.

---

## 3. Criar/verificar o banco

A aplicação tenta criar automaticamente o banco `db_em` caso ele não exista.

Também é possível executar manualmente:

```bash
npm run db:create
```

---

## 4. Rodar a aplicação

```bash
npm run dev
```

Ou:

```bash
npm start
```

Resultado esperado:

```text
Banco de dados "db_em" já existe.
Conexão com PostgreSQL realizada com sucesso.
Tabela sincronizada com sucesso.
Servidor rodando em http://localhost:3000
```

---

## 5. Testar as rotas

Rota raiz:

```text
http://localhost:3000/
```

Listar todas as leituras:

```text
http://localhost:3000/api/leituras
```

Pesquisar por data:

```text
http://localhost:3000/api/leituras/data/2026-04-01
```

Pesquisar dados importados do CSV:

```text
http://localhost:3000/api/leituras/data/2026-04-02
```

Testar data inválida:

```text
http://localhost:3000/api/leituras/data/01-04-2026
```

---

## 6. Importar dados via CSV

O arquivo CSV fica em:

```text
data/leituras.csv
```

Para importar:

```bash
npm run import:csv
```

Resultado esperado:

```text
Iniciando importação do CSV...
Conexão com PostgreSQL realizada com sucesso.
Tabela sincronizada com sucesso.
5 leituras importadas com sucesso.
```

Atenção: se executar a importação mais de uma vez, os dados poderão ser duplicados.

---

## 7. Enviar para o GitHub

```bash
git status
git add .
git commit -m "Adiciona aplicativo completo com importacao CSV"
git push
```

---

## Observações

Não envie para o GitHub:

```text
.env
node_modules
```

Envie:

```text
.env-exemplo
package.json
package-lock.json
src
data/leituras.csv
README.md
```
