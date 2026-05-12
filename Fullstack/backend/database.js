const Database = require('better-sqlite3');
const db = new Database('books.db');

// Skapa tabeller om de inte finns
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    genre TEXT,
    page_count INTEGER,      -- Ny!
    release_year INTEGER,    -- Ny!
    publisher TEXT,          -- Ny!
    isbn TEXT UNIQUE,        -- Ny!
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Hjälpfunktion för migrering
function addColumnIfMissing(table, column, type) {
  const columns = db.pragma(`table_info(${table})`).map(c => c.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    console.log(`✅ Lade till kolumn: ${table}.${column}`);
  }
}

// Kör migreringar för befintlig databas
addColumnIfMissing('books', 'page_count', 'INTEGER');
addColumnIfMissing('books', 'release_year', 'INTEGER');
addColumnIfMissing('books', 'publisher', 'TEXT');
addColumnIfMissing('books', 'isbn', 'TEXT');

module.exports = db;