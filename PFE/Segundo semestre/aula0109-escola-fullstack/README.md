# Projeto Escola

Cadastro, consulta, edição e exclusão de alunos com persistência em SQLite.
Consulte [Banco de dados e API](docs/BANCO_DE_DADOS.md) para preparar o banco,
executar o projeto e conferir as rotas e os testes.

## Organização

- `src/app`: páginas completas, estilos locais, layouts e rotas da API do Next.js.
- `src/components`: componentes compartilhados pelas páginas.
- `src/lib/server/controllers`: operações de servidor para alunos e notas.
- `src/lib/server/db`: conexão e inicialização do SQLite.
- `public`: arquivos estáticos, como imagens e ícones referenciados pelo navegador.
- `data/escola.db`: banco local, criado automaticamente e não versionado.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

As telas ficam diretamente nos `page.jsx` das pastas de rota em `src/app`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
