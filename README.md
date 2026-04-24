# InquiPass

MVP funcional de uma plataforma para criar, verificar e compartilhar um passaporte do inquilino.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Supabase preparado para Auth, Postgres e Storage

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Contas demo

- Inquilino: `marina@demo.com` / `123456`
- Imobiliaria: `imobiliaria@demo.com` / `123456`
- Admin: `admin@demo.com` / `123456`

O MVP funciona em modo mock/localStorage para ser testavel sem credenciais. Ao configurar Supabase, use as variaveis abaixo e aplique `supabase/migrations/001_initial_schema.sql`.

## Supabase

Crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

O upload de documentos usa `passport-documents`; sem Supabase configurado, os arquivos geram URLs mockadas.

## Fluxos incluidos

- Landing page
- Cadastro/login demo
- Dashboard do inquilino
- Dados pessoais com consentimento LGPD
- Upload de documentos
- Renda com aluguel recomendado
- Historico de aluguel
- Referencias
- Verificacoes mockadas
- Passaporte privado e publico por token
- Auditoria de acesso
- Dashboard da imobiliaria
- Admin interno
