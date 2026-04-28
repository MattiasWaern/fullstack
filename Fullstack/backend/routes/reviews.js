const router = require ('express').Router();
const db = require('../database');
const requireAuth = require ('../middleware/auth');


router.post('/', requireAuth, (req, res) => {
    const { book_id, rating, text} = req.body;
    if(!body_id || !rating || text)
        return res.status(400).json({error: 'book_id, betyg och text krävs'});

    const result = db.prepare(
        'INSERT INTO reviews (book_id, user_id, rating, text) VALUES (?, ?, ?, ?'
     ).run(book_id, req.user.id, rating, text);
     res.status(201).json({id: result.lastInsertRowid, book_id, rating, text});
});