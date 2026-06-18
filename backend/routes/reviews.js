const router = require('express').Router();
const db = require('../database');
const requireAuth = require('../middleware/auth');

// HÄMTA MINA RECENSIONER
router.get('/mine', requireAuth, (req, res) => {
  const reviews = db.prepare(`
    SELECT reviews.*, books.title as book_title, books.cover_url
    FROM reviews
    JOIN books ON reviews.book_id = books.id
    WHERE reviews.user_id = ?
    ORDER BY reviews.created_at DESC
  `).all(req.user.id);
  res.json(reviews);
});

// SKAPA EN NY RECENSION
router.post('/', requireAuth, (req, res) => {
  const { book_id, rating, text } = req.body;
  if (!book_id || !rating || !text)
    return res.status(400).json({ error: 'book_id, betyg och text krävs' });

  const result = db.prepare(
    'INSERT INTO reviews (book_id, user_id, rating, text) VALUES (?, ?, ?, ?)'
  ).run(book_id, req.user.id, rating, text);
  
  res.status(201).json({ id: result.lastInsertRowid, book_id, rating, text });
});

// TA BORT EN RECENSION
router.delete('/:id', requireAuth, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  
  if (!review) return res.status(404).json({ error: 'Recensionen hittades inte' });
  
  if (review.user_id !== req.user.id)
    return res.status(403).json({ error: 'Du kan bara ta bort dina egna recensioner' });

  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ message: 'Recension borttagen' });
});

// REDIGERA/UPPDATERA EN RECENSION
router.put('/:id', requireAuth, (req, res) => {
  const { rating, text } = req.body;
  const reviewId = req.params.id;

  if (!rating || !text) {
    return res.status(400).json({ error: 'Betyg och text krävs för att uppdatera' });
  }

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);

  if (!review) {
    return res.status(404).json({ error: 'Recensionen hittades inte' });
  }

  if (review.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Du kan bara redigera dina egna recensioner' });
  }

  db.prepare('UPDATE reviews SET rating = ?, text = ? WHERE id = ?')
    .run(rating, text, reviewId);

  res.json({ message: 'Recensionen har uppdaterats' });
});

module.exports = router;