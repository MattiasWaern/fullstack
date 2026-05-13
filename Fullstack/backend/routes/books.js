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

// Lägg till en bok i "Want to read"
router.post('/:id/want-to-read', requireAuth, (req, res) => {
    try{
        db.prepare(`
                INSERT OR IGNORE INTO want_to_read (user_id, book_id)
                VALUES (?, ? )
            `).run(req.user.id, req.params.id);

            res.json({message: 'Tillagd i din läslista'});
    } catch(err){
        res.status(500).json({error: 'Kunde inte spara'});
    }
});

// Ta bort från "Want to read"
router.delete('/:id/want-to-read', requireAuth, (req, res) => {
    try{
        db.prepare(`
                DELETE FROM want_to_read WHERE user_id = ? AND book_id = ?
            `).run(req.user.id, req.params.id);

            res.json({message: 'Borttagen från din läslista'});
    } catch(err){
        res.status(500).json({error: 'Kunde inte ta bort'});
    }
});

// Kolla om boken finns i användarens läslista
router.get('/:id/want-to-read-status', requireAuth, (req, res) => {
    try {
        const row = db.prepare(`
            SELECT 1 FROM want_to_read 
            WHERE user_id = ? AND book_id = ?
        `).get(req.user.id, req.params.id);

        // Om row existerar betyder det att boken är sparad
        res.json({ isWantToRead: !!row });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kunde inte hämta status' });
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

router.delete('/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    try {
        const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
        
        if (!book) {
            return res.status(404).json({ error: 'Boken hittades inte' });
        }

        if (book.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Du kan bara ta bort dina egna böcker' });
        }

        db.prepare('DELETE FROM reviews WHERE book_id = ?').run(id);
        const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);

        if (result.changes > 0) {
            console.log(`Bok med ID ${id} raderad från databasen.`);
            res.status(200).json({ message: 'Boken raderad permanent' });
        } else {
            res.status(404).json({ error: 'Kunde inte hitta boken i databasen' });
        }
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: 'Ett fel uppstod i databasen' });
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