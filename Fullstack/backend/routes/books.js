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

router.get('/search', async (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ error: 'Sökterm saknas' });

  const field = type === 'author' ? 'author' : 'title';
  const url = `https://openlibrary.org/search.json?${field}=${encodeURIComponent(q)}&limit=12&fields=key,title,author_name,cover_i,subject,first_sentence`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Ta BORT filtreringen - visa ALLA böcker från OpenLibrary
    // const filtered = (data.docs || []).filter(book =>
    //   book.author_name &&
    //   book.cover_i &&
    //   book.title.length < 80
    // ).slice(0, 8);

    // Använd istället alla böcker direkt från OpenLibrary
    const booksToProcess = (data.docs || []).slice(0, 12);

    // Hämta detaljinfo för varje bok parallellt
    const books = await Promise.all(booksToProcess.map(async book => {
      let description = book.first_sentence?.[0] || '';

      // Hämta beskrivning från bokens egen sida om den saknas
      if (!description && book.key) {
        try {
          const detailRes = await fetch(`https://openlibrary.org${book.key}.json`);
          const detail = await detailRes.json();
          description = typeof detail.description === 'string'
            ? detail.description
            : detail.description?.value || '';
          // Trunkera om den är för lång
          if (description.length > 400) description = description.slice(0, 400) + '...';
        } catch {
          description = '';
        }
      }

      return {
        id: book.key,
        title: book.title || 'Okänd titel',
        author: book.author_name?.join(', ') || 'Okänd författare',
        description: description || '',
        genre: book.subject?.slice(0, 3).join(', ') || '',
        cover_url: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
      };
    }));

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sökningen misslyckades' });
  }
});

router.get('/:id', (req, res) => {
    const book = db.prepare(`
        SELECT books.*, users.username as created_by_username
        FROM books LEFT JOIN users ON books.created_by = users.id
        WHERE books.id = ?
    `).get(req.params.id);
    if (!book) return res.status(404).json({ error: 'Boken hittades inte' });
    res.json(book);
});

router.post('/', requireAuth, (req, res) => {
  const { title, author, description, cover_url, genre } = req.body;
  if (!title || !author)
    return res.status(400).json({ error: 'Titel och författare krävs' });

  const result = db.prepare(
    'INSERT INTO books (title, author, description, cover_url, genre, created_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, author, description, cover_url, genre, req.user.id);
  res.status(201).json({ id: result.lastInsertRowid, title, author, description, cover_url, genre });
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

module.exports = router;