# Alpes News Frontend

Frontend React/Vite **somente frontend**.
Backend oficial do projeto: `C:\programas\newsportalBackend`.

## Requisitos
- Node 18+
- Backend Spring rodando

## Configuracao
Crie `.env` (ou `.env.local`) baseado no `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:9090/api
```

## Rodar
```bash
npm install
npm run dev
```

A aplicacao abre em `http://localhost:5173`.

## Fluxos conectados
- Home / categorias / busca: API Spring
- Artigo por slug: leitura + tracking de views
- Admin:
  - Dashboard com stats reais
  - Criacao/edicao/exclusao de artigos
  - Rascunho/publicacao
  - Cadastros (autores): criar/editar/excluir + upload de avatar
- Auth:
  - login
  - cadastro
  - forgot/reset password

## Banco no backend (PostgreSQL)
No backend Spring, as variaveis principais sao:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/portal_news
SPRING_DATASOURCE_USERNAME=newsportal_app
SPRING_DATASOURCE_PASSWORD=newsportal123
```

## Admin bootstrap (backend)
Conta admin automatica no backend (se nao existir):

- Email: `admin@newsportal.local`
- Senha: `admin123`

Variaveis opcionais:

```env
APP_BOOTSTRAP_ADMIN_ENABLED=true
APP_BOOTSTRAP_ADMIN_NAME=Admin Alpes News
APP_BOOTSTRAP_ADMIN_EMAIL=admin@newsportal.local
APP_BOOTSTRAP_ADMIN_PASSWORD=admin123
```