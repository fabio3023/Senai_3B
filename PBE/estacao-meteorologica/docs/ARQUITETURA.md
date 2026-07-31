# Arquitetura em N-Camadas

## 1. Visão geral

O projeto usa uma arquitetura em camadas com dependências apontando para dentro:

```text
Cliente HTTP
    ↓
Apresentação: Route → Middleware → Controller
    ↓
Aplicação: DTO → Service
    ↓
Domínio: Entity + Repository Contract + Domain Errors
    ↑
Infraestrutura: Sequelize Repository → ORM Model → PostgreSQL
```

A infraestrutura implementa contratos definidos pelo domínio. O arquivo `bootstrap/createContainer.js` conecta as implementações concretas às classes que precisam delas.

## 2. Responsabilidades

| Camada | Pasta | Pode conhecer | Não deve fazer |
|---|---|---|---|
| Apresentação | `src/presentation/http` | HTTP, controllers, services | SQL e regra de negócio |
| Aplicação | `src/application` | DTOs, serviços, domínio | Express e Sequelize |
| Domínio | `src/domain` | Regras centrais e contratos | HTTP, banco e variáveis de ambiente |
| Infraestrutura | `src/infrastructure` | PostgreSQL, Sequelize, arquivos | Decidir regras de negócio |
| Bootstrap | `src/bootstrap` | Todas as implementações | Conter regras da aplicação |
| Compartilhado | `src/shared` | Utilitários transversais | Concentrar regra específica de entidade |

## 3. Fluxo de criação

1. A rota recebe `POST /api/v1/leituras`.
2. O middleware `asyncHandler` encaminha erros assíncronos.
3. O controller entrega `req.body` ao service.
4. `CreateLeituraDTO` valida o formato e converte os nomes externos.
5. `Leitura.create()` aplica as regras do domínio.
6. O service chama o contrato de repositório.
7. `SequelizeLeituraRepository` converte a entidade para persistência.
8. `LeituraModel` grava no PostgreSQL.
9. `LeituraResponseDTO` controla o JSON devolvido.

## 4. Por que Model não é Entity

- `Leitura` é uma entidade de domínio: representa conceitos e regras do negócio.
- `LeituraModel` é um modelo ORM: representa uma tabela e detalhes do Sequelize.

Separar os dois evita que a regra de negócio dependa do banco de dados.

## 5. Injeção de dependência

As classes não importam instâncias globais umas das outras. Elas recebem dependências pelo construtor:

```js
const leituraService = new LeituraService({ leituraRepository });
const leituraController = new LeituraController({ leituraService });
```

Isso facilita testes com um repositório em memória.

## 6. Migrações

O projeto não usa `sequelize.sync()` para modificar tabelas. Os arquivos SQL numerados em `src/infrastructure/database/migrations` são executados uma única vez e registrados em `schema_migrations`.

## 7. Tratamento de erros

Erros esperados usam classes de domínio:

- `ValidationError` → HTTP 400
- `NotFoundError` → HTTP 404
- `ConflictError` → HTTP 409

O middleware central converte todos para um formato consistente e inclui `request_id`.
