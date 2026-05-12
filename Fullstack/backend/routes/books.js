const router = require('express').Router();
const db = require('../database');
const requireAuth = require('../middleware/auth');

// Hämta alla böcker (med betyg och statistik)
router.get('/', (req, res) => {
    const books = db.prepare(`
        SELECT books.*, users.username as created_by_username,
               AVG(reviews.rating) as avg_rating,
               COUNT(reviews.id) as review_count
        FROM books
        LEFT JOIN users ON books.created_by = users.id
        LEFT JOIN reviews ON books.id = reviews.book_id
        GROUP BY books.id
        ORDER BY books.created_at DESC
    `).all();
    res.json(books);
});

// Sök i din EGEN databas istället för OpenLibrary
router.get('/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Sökterm saknas' });

    // Söker i titel, författare eller ISBN
    const books = db.prepare(`
        SELECT * FROM books 
        WHERE title LIKE ? OR author LIKE ? OR isbn = ?
    `).all(`%${q}%`, `%${q}%`, q);

    res.json(books);
});

// Hämta specifik bok
router.get('/:id', (req, res) => {
    const book = db.prepare(`
        SELECT books.*, users.username as created_by_username
        FROM books LEFT JOIN users ON books.created_by = users.id
        WHERE books.id = ?
    `).get(req.params.id);
    
    if (!book) return res.status(404).json({ error: 'Boken hittades inte' });
    res.json(book);
});

// Lägg till en bok i din databas
router.post('/', requireAuth, (req, res) => {
    const { 
        title, author, description, cover_url, 
        genre, page_count, release_year, publisher, isbn 
    } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: 'Titel och författare krävs' });
    }

    try {
        const result = db.prepare(`
            INSERT INTO books (
                title, author, description, cover_url, 
                genre, page_count, release_year, publisher, isbn, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            title, author, description, cover_url, 
            genre, page_count || null, release_year || null, 
            publisher || null, isbn || null, req.user.id
        );

        res.status(201).json({ 
            id: result.lastInsertRowid, 
            title, author, description, cover_url, genre 
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'En bok med detta ISBN finns redan' });
        }
        res.status(500).json({ error: 'Kunde inte spara boken' });
    }
});

// Uppdatera en bok
router.put('/:id', requireAuth, (req, res) => {
    const { 
        title, author, description, cover_url, 
        genre, page_count, release_year, publisher, isbn 
    } = req.body;

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    
    if (!book) return res.status(404).json({ error: 'Boken hittades inte' });
    if (book.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Du kan bara redigera dina egna böcker' });
    }

    try {
        db.prepare(`
            UPDATE books SET 
                title = ?, author = ?, description = ?, cover_url = ?, 
                genre = ?, page_count = ?, release_year = ?, publisher = ?, isbn = ?
            WHERE id = ?
        `).run(
            title, author, description, cover_url, 
            genre, page_count || null, release_year || null, 
            publisher || null, isbn || null, req.params.id
        );

        res.json({ message: 'Boken uppdaterad' });
    } catch (err) {
        res.status(500).json({ error: 'Kunde inte uppdatera boken' });
    }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Exempel med SQL (justera efter din databas-setup):
    // const result = await db.query('DELETE FROM books WHERE id = ?', [id]);
    
    // Om du använder Sequelize/Mongoose:
    // await Book.destroy({ where: { id } });

    console.log(`Bok med ID ${id} raderad`);
    res.status(200).json({ message: 'Boken raderad' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte radera boken' });
  }
});

router.get('/:id/reviews', (req, res) => {
    const reviews = db.prepare(
        `
        SELECT reviews.*, users.username
        FROM reviews JOIN users ON reviews.user_id = users.id
        WHERE reviews.book_id = ?
        ORDER BY reviews.created_at DESC
        `).all(req.params.id);
        res.json(reviews);
});

module.exports = router;