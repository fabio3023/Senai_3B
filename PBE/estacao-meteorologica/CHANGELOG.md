# Changelog

## 2.1.0 — PostgreSQL local

- Remoção da infraestrutura de contêineres.
- Configuração padrão direcionada a `127.0.0.1:5432`.
- Scripts Windows e Linux para localizar, iniciar, verificar e parar o serviço PostgreSQL local.
- Script de primeiro uso para preparar dependências, ambiente, conexão e migrações.
- Novo comando `npm run db:check`.
- Tempo limite configurável para conexão ao banco.
- Diagnósticos claros para serviço parado, credenciais incorretas e falta de permissão.
- Documentação específica para operação com PostgreSQL instalado no computador.

## 2.0.0 — Estrutura profissional em N-Camadas

- Separação explícita entre domínio, aplicação, apresentação e infraestrutura.
- Entidade de domínio independente do Sequelize.
- Contrato e implementação de repositório.
- Injeção de dependência por construtor.
- Migrações SQL em substituição ao `sequelize.sync()`.
- DTOs distintos para POST, PUT, PATCH, filtros e parâmetros.
- Validações de paginação, ID, campos desconhecidos e intervalos de data.
- Índices, restrições CHECK e unicidade no PostgreSQL.
- Importação CSV transacional.
- Health checks live/ready.
- Logs estruturados e request ID.
- Erros HTTP padronizados.
- CORS configurável e cabeçalhos de segurança.
- Encerramento seguro.
- Testes unitários com repositório em memória.
- Documentação de arquitetura e roteiro de aula.
