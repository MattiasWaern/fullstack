const { Pool } = require("pg");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL saknas");
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: true },
});
module.exports = db;
