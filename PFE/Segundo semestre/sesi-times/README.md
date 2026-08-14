# SESI Times

Portal escolar full-stack para apresentar equipes, publicar agenda e resultados, compartilhar notícias e receber solicitações de novos times. O projeto usa Next.js, React e um banco SQLite local, sem depender de serviços externos.

## Funcionalidades

### Portal público

- Página inicial com time em destaque, agenda e notícias carregadas pela API.
- Catálogo com busca, filtro por categoria e filtro de favoritos.
- Perfis dinâmicos conectados ao banco para todos os times, inclusive o Terceiro Médio B.
- Agenda com filtros de próximos eventos, resultados e tipo de atividade.
- Exportação de eventos no formato `.ics` para calendários.
- Notícias com busca e filtros.
- Galeria com visualização ampliada acessível por teclado.
- Solicitação pública de cadastro de equipes com consentimento, honeypot e limite de envios.
- Favoritos persistidos no navegador e compartilhamento nativo ou por cópia de link.
- Tema claro/escuro persistente, avisos do navegador e botão de retorno ao topo.
- Manifesto, instalação como aplicativo e modo offline básico em produção.

### Administração

- Login por credenciais de ambiente e sessão em cookie `httpOnly` assinado com HMAC.
- Dashboard com indicadores e solicitações pendentes.
- Cadastro e exclusão de times, eventos, notícias e fotos.
- Publicação ou rascunho de conteúdo.
- Aprovação e recusa de solicitações enviadas pelo portal.
- Validação no cliente e no servidor, proteção de origem, limite de tentativas e respostas HTTP claras.

## Requisitos

- Node.js 22.13 ou mais recente — o banco utiliza o módulo nativo `node:sqlite` sem exigir uma flag experimental.
- npm 11 ou versão compatível.

## Configuração inicial

Instale as dependências:

```bash
npm install
```

Copie o arquivo de exemplo:

```powershell
Copy-Item .env.example .env.local
```

Edite `.env.local` e substitua todos os valores de exemplo:

```env
SESI_DB_PATH=data/sesi-times.db
ADMIN_EMAIL=seu-email@escola.com
ADMIN_PASSWORD=uma-senha-forte-e-exclusiva
SESSION_SECRET=um-segredo-aleatorio-com-pelo-menos-32-caracteres
SESSION_COOKIE_SECURE=false
```

Um segredo pode ser gerado localmente com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use `SESSION_COOKIE_SECURE=true` somente quando o site estiver servido por HTTPS.

## Execução

Desenvolvimento:

```bash
npm run dev
```

Produção local:

```bash
npm run build
npm start
```

Abra [http://localhost:3000](http://localhost:3000). O painel fica em [http://localhost:3000/admin](http://localhost:3000/admin).

## Banco de dados

O banco é criado automaticamente no primeiro acesso à API. As migrações são idempotentes e o conteúdo inicial contém apenas:

- o time conhecido `3b`;
- uma notícia sobre o lançamento do próprio portal;
- nenhum jogo, resultado, foto ou solicitação fictícia.

O arquivo padrão fica em `data/sesi-times.db` e não é versionado. Para backup, copie o banco somente com a aplicação parada ou utilize uma ferramenta SQLite capaz de fazer backup consistente de WAL.

> SQLite exige armazenamento persistente. Em hospedagens serverless com sistema de arquivos temporário, configure outro adaptador de banco antes de publicar. O projeto funciona diretamente em um servidor Node com volume persistente.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Página inicial |
| `/times` | Busca e catálogo de equipes |
| `/times/3b` | Perfil dinâmico do Terceiro Médio B |
| `/times/[slug]` | Perfil dinâmico de novos times |
| `/agenda` | Agenda, resultados e exportação de calendário |
| `/noticias` | Notícias publicadas |
| `/galeria` | Fotos publicadas |
| `/participar` | Solicitação de novo time |
| `/admin` | Administração protegida |

As APIs ficam sob `/api/public`, `/api/team-requests`, `/api/auth/*` e `/api/admin/*`.

## Validação

```bash
npm run lint
npm run build
```

Ou execute as duas verificações em sequência:

```bash
npm run check
```

## Estrutura principal

```text
src/
├── app/
│   ├── admin/              # Painel administrativo
│   ├── agenda/             # Agenda pública
│   ├── api/                # Rotas HTTP públicas e protegidas
│   ├── components/         # Interface e recursos interativos
│   ├── galeria/            # Galeria pública
│   ├── noticias/           # Notícias públicas
│   ├── participar/         # Solicitação de cadastro
│   └── times/              # Catálogo e perfis
└── lib/
    ├── auth.js             # Sessões assinadas
    ├── data.js             # Repositório e regras de conteúdo
    ├── db.js               # SQLite e migrações
    ├── http.js             # Respostas e segurança HTTP
    ├── rate-limit.js       # Limites de login e solicitações
    └── validation.js       # Validação compartilhada
```

## Conteúdo e privacidade

Publique agenda, resultados, nomes e fotos somente depois da confirmação da escola e das autorizações necessárias. Solicitações públicas não são aprovadas automaticamente e não aparecem no catálogo antes da análise administrativa.
