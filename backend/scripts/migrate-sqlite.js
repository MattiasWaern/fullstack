require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Sqlite = require("better-sqlite3");
const db = require("../database");
const source =
  process.env.SQLITE_PATH || path.join(__dirname, "..", "books.db");
if (!fs.existsSync(source)) throw new Error("SQLite-filen saknas: " + source);
const sqlite = new Sqlite(source, { readonly: true });
const tables = [
  "users",
  "books",
  "reviews",
  "want_to_read",
  "reading_progress",
];
(async () => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8"),
    );
    for (const table of tables) {
      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      const existing = (
        await client.query(`SELECT COUNT(*)::integer AS n FROM ${table}`)
      ).rows[0].n;
      if (existing)
        throw new Error(
          `${table} innehåller redan ${existing} rader. Avbryter för att skydda data.`,
        );
      const columns = sqlite
        .prepare(`PRAGMA table_info(${table})`)
        .all()
        .map((c) => c.name);
      const target =
        table === "reviews"
          ? columns.map((c) => (c === "comment" ? "text" : c))
          : columns;
      for (const row of rows) {
        const params = columns.map((c) => row[c]);
        await client.query(
          `INSERT INTO ${table}(${target.map((c) => '"' + c + '"').join(",")}) VALUES(${params.map((_, i) => "$" + (i + 1)).join(",")})`,
          params,
        );
      }
      console.log(`${table}: ${rows.length} poster`);
    }
    for (const table of ["users", "books", "reviews", "reading_progress"])
      await client.query(
        `SELECT setval(pg_get_serial_sequence($1,'id'),COALESCE((SELECT MAX(id) FROM ${table}),1), (SELECT COUNT(*)>0 FROM ${table}))`,
        [table],
      );
    await client.query("COMMIT");
    console.log("Migreringen är klar!");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Migreringen avbröts:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
    sqlite.close();
  }
})();
