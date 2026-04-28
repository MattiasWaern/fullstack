const router = require ('express').Router();
const db = require('../database');
const requireAuth = require ('../middleware/auth');

router.get('/', (req, res) => {
    const books = db.prepare(
    `
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

router.get('/:id', (req, res) => {
    const book = db.prepare(
        `
        SELECT books.*, users.username as created_by_username,
        FROM books LEFT JOIN users ON books.created_by = users.id
        WHERE books.id = ?
        `).get(req.params.id);
        if(!book) return res.status(404).json({error: 'Boken hittades inte'});
        res.json(book);
});

router.post('/', requireAuth, (req, res) => {
    const {title, author, description} = req.body;
    if (!title || !author)
        return res.status(404).json({error: 'Titel och författare krävs'});

    const result = db.prepare(
        'INSERT INTO books (title, author, description, created_by) VALUES (?, ?, ?, ?)'
    ).run.status(201).json({id: result.lastInsertRowId, title, author, description});
});

router.delete('/:id', requireAuth, (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if(!book) return res.status(404).json({error: 'Boken hittade inte'});
    if(book.created_by !== req.user.id)
        return res.status(403).json({error: 'Du kan bara ta bort dina egna böcker'});

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({message: 'Boken borttagen'});
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