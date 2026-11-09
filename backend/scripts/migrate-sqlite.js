const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const pg = require("../database");
const sqlitePath =
  process.env.SQLITE_PATH || path.join(__dirname, "../books.db");
if (!fs.existsSync(sqlitePath)) {
  console.error("SQLite-fil saknas:", sqlitePath);
  process.exit(1);
}
const sqlite = new Database(sqlitePath, {
  readonly: true,
  fileMustExist: true,
});
const tables = [
  "users",
  "books",
  "reviews",
  "want_to_read",
  "reading_progress",
];
const columns = {
  users: ["id", "username", "password", "created_at"],
  books: [
    "id",
    "title",
    "author",
    "description",
    "cover_url",
    "genre",
    "page_count",
    "release_year",
    "publisher",
    "isbn",
    "created_by",
    "created_at",
  ],
  reviews: ["id", "book_id", "user_id", "rating", "text", "created_at"],
  want_to_read: ["user_id", "book_id", "created_at"],
  reading_progress: [
    "id",
    "user_id",
    "book_id",
    "current_page",
    "created_at",
    "updated_at",
  ],
};
(async () => {
  const client = await pg.connect();
  try {
    await client.query("BEGIN");
    const exists = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=ANY($1)`,
      [tables],
    );
    if (exists.rows.length !== tables.length)
      throw new Error("Skapa först tabellerna med npm run schema");
    for (const table of tables) {
      const n = await client.query(
        `SELECT COUNT(*)::integer AS n FROM ${table}`,
      );
      if (n.rows[0].n)
        throw new Error(
          `Avbryter: ${table} innehåller redan data. Migrera endast till tom databas.`,
        );
    }
    for (const table of tables) {
      const sourceCols = sqlite
        .pragma(`table_info(${table})`)
        .map((c) => c.name);
      let selected = columns[table];
      if (
        table === "reviews" &&
        !sourceCols.includes("text") &&
        sourceCols.includes("comment")
      )
        selected = selected.map((c) => (c === "text" ? "comment" : c));
      const missing = selected.filter((c) => !sourceCols.includes(c));
      if (missing.length)
        throw new Error(`Kolumner saknas i ${table}: ${missing.join(", ")}`);
      const data = sqlite
        .prepare(
          `SELECT ${selected.map((c) => '"' + c + '"').join(",")} FROM "${table}"`,
        )
        .all();
      for (const row of data) {
        const values = selected.map((c) => row[c]);
        const target = columns[table];
        const placeholders = values.map((_, i) => "$" + (i + 1));
        await client.query(
          `INSERT INTO ${table}(${target.join(",")}) VALUES(${placeholders.join(",")})`,
          values,
        );
      }
      console.log(`${table}: ${data.length} rader`);
    }
    for (const table of ["users", "books", "reviews", "reading_progress"])
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${table}','id'),COALESCE((SELECT MAX(id) FROM ${table}),1),(SELECT COUNT(*)>0 FROM ${table}))`,
      );
    await client.query("COMMIT");
    console.log("Migrering klar! Kontrollera datan innan du byter backend.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Migrering avbruten:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pg.end();
    sqlite.close();
  }
})();
