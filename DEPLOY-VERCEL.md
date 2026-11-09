# Publicera MyReads på Vercel

## Frontend
Skapa ett Vercel-projekt från samma GitHub-repository som backend.

- **Root Directory:** repository root (`./`), INTE `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (eller standard)
- **Environment Variable:** `VITE_API_URL=https://DIN-BACKEND.vercel.app/api`

`vercel.json` i rotmappen anger också frontendens bygginställningar och React Router fallback.

## Backend
Skapa ett separat Vercel-projekt från samma repository.

- **Root Directory:** `backend`
- **Environment Variables:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- **FRONTEND_URL:** frontendens faktiska Vercel-domän, utan avslutande `/`

Testa `https://DIN-BACKEND.vercel.app/api/books`.

## Viktigt
`backend/.env` och `backend/books.db` är avsiktligt inte med i ZIP-filen. Lägg hemligheter enbart i Vercel Environment Variables och i lokal `.env` som inte committas.

När frontendens miljövariabel har ändrats måste frontend deployas igen.
