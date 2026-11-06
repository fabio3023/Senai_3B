# Banco de dados da escola

O sistema usa SQLite com `better-sqlite3`. O arquivo é criado automaticamente em
`data/escola.db` e não precisa de um servidor de banco separado.

## Iniciar o projeto

Na pasta `PFE/Segundo semestre/aula0109-escola-fullstack`, execute:

```powershell
npm install
npm run db:init
npm run dev
```

O comando `db:init` cria as tabelas que estiverem ausentes, preserva os dados já
cadastrados e executa uma verificação de integridade.

## Estrutura

As telas e rotas ficam diretamente em `src/app`, conforme o App Router do
Next.js, com cada tela e seu CSS na pasta correspondente. Componentes
compartilhados ficam em `src/components`; a lógica exclusivamente de servidor
(controladores e conexão com o banco) fica em `src/lib/server`. Arquivos
estáticos usados pela interface ficam em `public/`; o banco local fica fora de
`src`, em `data/`.

| Tabela | Campos | Regras |
| --- | --- | --- |
| `alunos` | `id_aluno`, `nome`, `idade`, `serie`, `ra` | ID automático, idade de 1 a 120 e RA único |
| `notas` | `id_notas`, `aluno_id`, `t1`, `t2`, `n1`, `n2`, `n3` | Notas de 0 a 10 e vínculo obrigatório com um aluno |

O RA é armazenado como texto para preservar zeros à esquerda. Quando um aluno é
excluído, suas notas também são removidas por meio de `ON DELETE CASCADE`.

Para usar outro arquivo durante testes ou em outro ambiente, defina a variável
`ESCOLA_DB_PATH` antes de iniciar o sistema.

## Telas

| Rota | Função |
| --- | --- |
| `/cadalunos` | Cadastrar aluno ou editar usando `?editar=ID` |
| `/listalunos` | Buscar, listar, editar e excluir alunos |
| `/cadnotas` | Lançar notas ou editar usando `?editar=ID` |
| `/notas` | Buscar, listar, editar e excluir boletins |
| `/login` | Acessar a tela principal (fluxo demonstrativo) |
| `/registro` | Preencher o formulário e seguir para o login (sem persistência ainda) |

As rotas antigas `/alunos`, `/editalunos` e `/editanota` redirecionam para suas
rotas atuais. `/editalunos/[id]` e `/editanota/[id]` encaminham para os
formulários de edição em `/cadalunos?editar=ID` e `/cadnotas?editar=ID`.

## API

| Método | Rota | Operação |
| --- | --- | --- |
| `GET` | `/api/alunos` | Listar alunos |
| `POST` | `/api/alunos` | Cadastrar aluno |
| `GET` | `/api/alunos/1` | Consultar aluno |
| `PUT` | `/api/alunos/1` | Editar aluno |
| `DELETE` | `/api/alunos/1` | Excluir aluno e suas notas |
| `GET` | `/api/notas` | Listar notas com os dados dos alunos |
| `POST` | `/api/notas` | Cadastrar notas |
| `GET` | `/api/notas/1` | Consultar notas |
| `PUT` | `/api/notas/1` | Editar notas |
| `DELETE` | `/api/notas/1` | Excluir notas |

Exemplo de aluno:

```json
{
  "nome": "Ana Luisa",
  "idade": 17,
  "serie": "3B",
  "ra": "00909030"
}
```

Exemplo de notas:

```json
{
  "aluno_id": 1,
  "t1": 8,
  "t2": 9,
  "n1": 7,
  "n2": 8,
  "n3": 10
}
```

## Verificação

```powershell
npm test
npm run lint
npm run build
```

Os testes usam um banco temporário e cobrem cadastro, consulta, listagem, edição,
exclusão, validação, RA duplicado, integridade dos vínculos e exclusão em cascata.
