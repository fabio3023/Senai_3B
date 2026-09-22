# Banco de dados da escola

O projeto usa SQLite com better-sqlite3. Execute os comandos na pasta
`PFE/Segundo semestre/aula0109-escola-fullstack`, usando Node.js 24:

```powershell
npm install
npm run db:init
npm run dev
```

Abra `http://localhost:3000/alunos` para cadastrar e
`http://localhost:3000/listalunos` para consultar, editar ou excluir.
O formulário de edição carrega os dados atuais e salva pelo ID do aluno.
A exclusão pede confirmação e também remove as notas vinculadas.

## Arquivo e estrutura

- Arquivo padrão: `src/app/db/escola.db`, criado automaticamente.
- A variável de ambiente `ESCOLA_DB_PATH` permite usar outro arquivo.
- A conexão e a criação das tabelas estão em `src/app/db/banco.js`.
- As operações estão em `src/app/controllers/alunos.js`.
- Os arquivos do banco são locais e estão ignorados pelo Git.

| Tabela | Campos | Regras |
| --- | --- | --- |
| alunos | id_aluno, nome, idade, serie, ra | ID automático, campos obrigatórios, RA único |
| notas | id_notas, aluno_id, t1, t2, n1, n2, n3 | aluno_id referencia alunos.id_aluno; exclusão em cascata |

O RA é texto para preservar zeros à esquerda. Nome, série e RA são
normalizados para remover espaços nas extremidades. A idade deve ser inteira
entre 1 e 120. Todas as escritas da API são validadas e usam parâmetros SQL.
Existem índices para o nome do aluno e para a referência das notas.

A inicialização preserva tabelas e registros existentes. As restrições
`CHECK` são aplicadas na criação de novas tabelas; bancos antigos continuam
recebendo a validação pela API. Não há importação automática de alunos de
exemplo. A lista exibe o último conjunto de notas do aluno, quando houver;
o cadastro de notas em `/cadnotas` ainda é uma tela demonstrativa.

## Rotas

| Método | Rota | Operação |
| --- | --- | --- |
| GET | /api/alunos | listarAlunos |
| POST | /api/alunos | salvarAlunos |
| GET | /api/alunos/1 | buscarAluno |
| PUT | /api/alunos/1 | editarAlunos |
| DELETE | /api/alunos/1 | excluirAlunos |

POST e PUT recebem os quatro campos:

```json
{
  "nome": "Ana Luisa",
  "idade": 17,
  "serie": "3B",
  "ra": "00909030"
}
```

Respostas: 201 no cadastro; 200 nas consultas, edição e exclusão;
400 para dados inválidos; 404 para aluno inexistente; 409 para RA repetido;
500 para falha interna.

## Verificação

```powershell
npm test
npm run lint
npm run build
```

Os testes usam um arquivo SQLite temporário independente do banco da escola.
Cobrem persistência, edição, exclusão em cascata, preservação de outros alunos,
RA duplicado, validação e registros inexistentes.
