# Roteiro didático sugerido

## Aula 1 — O problema e o HTTP

Apresente a entidade leitura, os verbos HTTP e o arquivo `requests.http`. Execute somente liveness e rota raiz.

## Aula 2 — Route e Controller

Mostre que a Route decide o caminho e o Controller traduz HTTP para a aplicação. Evite escrever regra de negócio no Controller.

## Aula 3 — DTO e validação

Compare o JSON externo em `snake_case` com os nomes internos em `camelCase`. Teste campo ausente, campo desconhecido e paginação inválida.

## Aula 4 — Entidade e regra de negócio

Explore `Leitura.create()`. Demonstre por que umidade acima de 100 é rejeitada independentemente de HTTP ou banco.

## Aula 5 — Service

Acompanhe um caso de uso completo: criar, buscar, atualizar e excluir. O Service orquestra, mas não escreve SQL.

## Aula 6 — Repository e ORM

Compare o contrato `domain/repositories/LeituraRepository.js` com a implementação Sequelize. Explique que o Service depende do contrato.

## Aula 7 — PostgreSQL e migrações

Abra `001_create_leituras.sql`, explique chave primária, restrições, índice e unicidade. Execute `npm run db:migrate`.

## Aula 8 — Testes e injeção de dependência

Execute `npm test`. Mostre que o Service é testado sem PostgreSQL usando `InMemoryLeituraRepository`.

## Aula 9 — Observabilidade e segurança básica

Analise `request_id`, logs estruturados, cabeçalhos de segurança, CORS e health checks.

## Aula 10 — Evolução proposta

Adicione pressão atmosférica, velocidade do vento e precipitação criando uma nova migração, atualizando Entity, DTO, Model, Repository e testes.
