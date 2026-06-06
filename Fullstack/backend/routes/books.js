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

// Sök i din EGEN databas
router.get('/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Sökterm saknas' });

    const books = db.prepare(`
        SELECT * FROM books 
        WHERE title LIKE ? OR author LIKE ? OR isbn = ?
    `).all(`%${q}%`, `%${q}%`, q);

    res.json(books);
});

// HÄMTA MIN LÄSLISTA 
router.get('/my/want-to-read', requireAuth, (req, res) => {
    try {
        const books = db.prepare(`
            SELECT books.* FROM books
            JOIN want_to_read ON books.id = want_to_read.book_id
            WHERE want_to_read.user_id = ?
            ORDER BY want_to_read.created_at DESC
        `).all(req.user.id);
        
        res.json(books);
    } catch (err) {
        console.error("Fel vid hämtning av läslista:", err);
        res.status(500).json({ error: 'Kunde inte hämta din lista' });
    }
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
    try {
        db.prepare(`
            INSERT OR IGNORE INTO want_to_read (user_id, book_id)
            VALUES (?, ?)
        `).run(req.user.id, req.params.id);

        res.json({ message: 'Tillagd i din läslista' });
    } catch (err) {
        res.status(500).json({ error: 'Kunde inte spara' });
    }
});

// Ta bort från "Want to read"
router.delete('/:id/want-to-read', requireAuth, (req, res) => {
    try {
        db.prepare(`
            DELETE FROM want_to_read WHERE user_id = ? AND book_id = ?
        `).run(req.user.id, req.params.id);

        res.json({ message: 'Borttagen från din läslista' });
    } catch (err) {
        res.status(500).json({ error: 'Kunde inte ta bort' });
    }
});

// Kolla om boken finns i användarens läslista
router.get('/:id/want-to-read-status', requireAuth, (req, res) => {
    try {
        const row = db.prepare(`
            SELECT 1 FROM want_to_read 
            WHERE user_id = ? AND book_id = ?
        `).get(req.user.id, req.params.id);

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

// Radera en bok
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
        db.prepare('DELETE FROM want_to_read WHERE book_id = ?').run(id); // Rensar även läslistan
        const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);

        if (result.changes > 0) {
            res.status(200).json({ message: 'Boken raderad permanent' });
        } else {
            res.status(404).json({ error: 'Kunde inte hitta boken i databasen' });
        }
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: 'Ett fel uppstod i databasen' });
    }

    router.get('/my/reading-progress', requireAuth, (req, res) => {
    try {
        const progress = db.prepare(`
            SELECT 
                reading_progress.current_page,
                reading_progress.book_id,
                books.title,
                books.author,
                books.cover_url,
                books.page_count
            FROM reading_progress
            JOIN books ON reading_progress.book_id = books.id
            WHERE reading_progress.user_id = ?
            ORDER BY reading_progress.updated_at DESC
        `).all(req.user.id);
        
        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kunde inte hämta lässtatus' });
    }
});

router.post('/:id/progress', requireAuth, (req, res) => {
    const { current_page } = req.body;
    const bookId = req.params.id;

    if (current_page === undefined) {
        return res.status(400).json({ error: 'current_page krävs' });
    }

    try {
        // Kolla hur många sidor boken har totalt
        const book = db.prepare('SELECT page_count FROM books WHERE id = ?').get(bookId);
        if (!book) return res.status(404).json({ error: 'Boken hittades inte' });
        
        // Se till att man inte kan skriva in fler sidor än vad boken har
        if (book.page_count && current_page > book.page_count) {
            return res.status(400).json({ error: `Boken har bara ${book.page_count} sidor!` });
        }

      
        db.prepare(`
            INSERT INTO reading_progress (user_id, book_id, current_page, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, book_id) DO UPDATE SET
                current_page = excluded.current_page,
                updated_at = CURRENT_TIMESTAMP
        `).run(req.user.id, bookId, current_page);

        res.json({ message: 'Framsteg sparade', current_page });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kunde inte spara framsteg' });
    }
});
});

// Hämta recensioner för en bok
router.get('/:id/reviews', (req, res) => {
    const reviews = db.prepare(`
        SELECT reviews.*, users.username
        FROM reviews JOIN users ON reviews.user_id = users.id
        WHERE reviews.book_id = ?
        ORDER BY reviews.created_at DESC
    `).all(req.params.id);
    res.json(reviews);
});

module.exports = router;