# backend-base-em

API RESTful estruturada para monitoramento e controle de leituras de estações meteorológicas (EM).

## Arquitetura em N-Camadas
Este projeto implementa uma separação modular rígida garantindo responsabilidade única:
- **Routes**: Mapeamento de endpoints HTTP.
- **Controllers**: Captura requisições e envia respostas. Não conhece regras nem banco.
- **DTOs**: Validação e sanitização estrita estrutural de entrada/saída.
- **Services**: O coração da regra de negócios e orquestração.
- **Repositories**: Isolamento absoluto das interações SQL com o Sequelize.
- **Models**: Estruturas de mapeamento relacional.

## Como Executar
1. Instale dependências: `npm install`
2. Copie `.env.example` para `.env` e configure suas credenciais locais do Postgres.
3. Inicie em desenvolvimento: `npm run dev`
4. Popule os dados rodando: `npm run import:csv:clear`
