# MyReads backend – PostgreSQL

Express API migrated from SQLite to PostgreSQL. Existing endpoints and response fields are retained.

## 1. Install

```bash
npm install
```

Copy `.env.example` to `.env` and set `DATABASE_URL`, a new long random `JWT_SECRET`, and `FRONTEND_URL` (the deployed Vercel origin, without trailing slash). Never commit `.env` or `books.db`.

## 2. Create tables

Run `schema.sql` in Neon SQL Editor, or use the migration script below (it creates the schema automatically).

## 3. Move existing data (optional)

Put your existing `books.db` next to `server.js` **locally only**, or set `SQLITE_PATH` to its path. Make sure the target database is empty, then run:

```bash
npm run migrate
```

The script runs in a transaction, preserves IDs and password hashes, and refuses to overwrite tables with existing rows. Keep your original database backed up. Do not run this repeatedly against production.

## 4. Start locally

```bash
npm run dev
```

Health endpoint: `GET /api/health`.

## 5. Render deployment

Create a Node web service pointing to the backend directory. Build: `npm install --omit=dev`; start: `npm start`. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` in Render. The database must already have the schema and migrated data. Use a PostgreSQL URL that supports TLS; adjust `DB_SSL` only for a local trusted PostgreSQL server.

## 6. Vercel frontend

Set `VITE_API_URL` to your Render service URL **including `/api`**, e.g. `https://your-service.onrender.com/api`, if your frontend Axios code uses `/books`, `/reviews`, `/auth` paths. Redeploy the frontend after setting it. The frontend must not use `localhost` in production. Keep `JWT_SECRET` and `DATABASE_URL` only on the backend.

## Notes

- The original SQLite schema had a `comment`/`text` mismatch in reviews. This version uses `text`, matching the existing review routes and uploaded database.
- The delete-book route now relies on foreign-key cascades for reviews and want-to-read. `reading_progress` also references books and needs `ON DELETE CASCADE` to permit deletion of books with reading progress. See schema.sql.
- This package does not contain your real `.env` or database. Migration requires your local original `books.db`.
- Change your JWT secret from any previously used placeholder before going live; existing sessions may need to log in again.
