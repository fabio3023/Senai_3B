# Arquitetura do projeto

## Fluxo principal

```text
Requisição HTTP
      |
      v
Routes -> Validators -> Controller -> Service -> Repository -> Sequelize -> PostgreSQL
                                  |
                                  v
                              DTOs e regras
```

## Responsabilidade de cada área

### `domain`
Contém a entidade `Product` e o contrato abstrato do repositório. Não conhece Express nem PostgreSQL.

### `application`
Contém DTOs e o serviço de produtos. O serviço concentra regras como impedir SKU duplicado e tratar produto inexistente.

### `infrastructure`
Implementa detalhes técnicos: conexão PostgreSQL, modelo Sequelize, criação automática do banco e repositório concreto.

### `presentation`
Recebe HTTP, valida entradas, chama os serviços e transforma erros em respostas HTTP padronizadas.

### `bootstrap`
Monta as dependências. É o local onde repositório, serviço e controller são conectados.

### `shared`
Guarda elementos reutilizáveis, como `AppError`.

## Princípios aplicados

- Separação de responsabilidades.
- Inversão de dependência entre serviço e repositório.
- Validação na borda da aplicação.
- Tratamento centralizado de erros.
- Configuração por variáveis de ambiente.
- Entrega de respostas padronizadas.
