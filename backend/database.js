require("dotenv").config();
const { Pool } = require("pg");
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL saknas i backend/.env");
const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
module.exports = db;
