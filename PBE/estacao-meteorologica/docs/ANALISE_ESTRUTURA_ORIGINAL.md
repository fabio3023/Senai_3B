# Análise técnica da estrutura original

## Parecer geral

A estrutura original era adequada como primeiro contato com APIs em camadas. Ela já continha Route, Controller, DTO, Service, Repository, Model, Middlewares e configuração do banco. Entretanto, as pastas sozinhas não garantiam a separação real das responsabilidades.

Para uma base profissional e didaticamente consistente, a revisão foi necessária.

## Pontos positivos preservados

- Node.js e Express como camada HTTP.
- PostgreSQL com Sequelize.
- CRUD de leituras meteorológicas.
- DTO de entrada e saída.
- Repository entre Service e ORM.
- Importação CSV.
- Scripts para Windows e Linux.
- Arquivo `requests.http`.
- Paginação e filtros.

## Problemas encontrados

### 1. Model do Sequelize tratado como entidade

O arquivo em `models` representava simultaneamente a tabela e o conceito de negócio. Isso faz a regra central depender do ORM.

**Correção:** criação de `domain/entities/Leitura.js` e renomeação do componente de banco para `LeituraModel`.

### 2. Dependências globais

Controller importava Service; Service importava Repository; Repository importava Model. Isso dificulta testes e troca de infraestrutura.

**Correção:** injeção por construtor e composição em `bootstrap/createContainer.js`.

### 3. Ausência de contrato de repositório

O Service dependia diretamente da implementação Sequelize.

**Correção:** contrato em `domain/repositories/LeituraRepository.js` e implementação em `infrastructure/repositories`.

### 4. Uso de `sequelize.sync()`

`sync()` é conveniente no início, mas não documenta a evolução do banco e pode gerar diferenças entre ambientes.

**Correção:** migrações SQL numeradas e tabela `schema_migrations`.

### 5. Configuração espalhada

Variáveis de ambiente eram lidas em vários arquivos com valores padrão repetidos.

**Correção:** configuração central, validada e imutável em `config/env.js`.

### 6. Validação incompleta

- IDs inválidos chegavam ao ORM.
- `page=abc` gerava `NaN`.
- campos desconhecidos eram ignorados.
- PUT e atualização parcial não eram diferenciados.
- a data final simples excluía a maior parte do último dia.

**Correção:** DTOs específicos para criação, atualização, consulta e ID; inclusão de PATCH; datas simples interpretadas no fuso configurado.

### 7. Regras somente no DTO

Uma entidade criada por CSV, teste ou outro canal poderia contornar regras importantes.

**Correção:** regras centrais em `Leitura.create()`, independentes do canal de entrada.

### 8. Importação sem transação de substituição

Ao limpar e importar, uma falha poderia deixar a tabela vazia ou parcialmente populada.

**Correção:** `replaceAll()` executa limpeza e importação na mesma transação.

### 9. Ausência de unicidade e restrições no banco

A mesma estação e horário poderiam ser duplicados, e o banco aceitava umidade fora de 0–100.

**Correção:** `UNIQUE (station_id, timestamp)`, CHECKs e índices.

### 10. Health check superficial

O endpoint informava que a API estava ligada sem testar o PostgreSQL.

**Correção:** separação entre liveness e readiness.

### 11. Tratamento de erro pouco padronizado

A resposta possuía somente uma mensagem e não facilitava rastreamento.

**Correção:** código, mensagem, detalhes e `request_id`, com log estruturado.

### 12. Ausência de testes

A arquitetura não demonstrava sua principal vantagem: poder testar regras sem banco e sem HTTP.

**Correção:** testes com `node:test` e repositório em memória.

### 13. Inicialização e encerramento

Não havia encerramento controlado das conexões e do servidor.

**Correção:** tratamento de SIGINT/SIGTERM e fechamento seguro.

## Resultado

A versão revisada é uma implementação de n-camadas real, porque as fronteiras são verificáveis:

- o domínio não importa Express ou Sequelize;
- a aplicação não importa o Model ORM;
- o Controller não acessa o banco;
- o Repository não decide regra de negócio;
- a implementação concreta é conectada somente no bootstrap;
- os testes substituem PostgreSQL por uma implementação em memória.
