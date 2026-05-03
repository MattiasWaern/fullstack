import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(3);
  const [text, setText] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    api.get(`/books/${id}`).then(r => setBook(r.data));
    api.get(`/books/${id}/reviews`).then(r => setReviews(r.data));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    const { data } = await api.post('/reviews', { book_id: id, rating, text });
    setReviews([{ ...data, username: localStorage.getItem('username') }, ...reviews]);
    setText('');
    setRating(3);
  }

  if (!book) return <p>Laddar...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      {book.description && <p>{book.description}</p>}

      <h3>Recensioner</h3>

      {isLoggedIn && (
        <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <label>Betyg:
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
          <textarea placeholder="Skriv din recension..." value={text} onChange={e => setText(e.target.value)} required rows={3} />
          <button type="submit">Skicka recension</button>
        </form>
      )}

      {reviews.length === 0 && <p>Inga recensioner än.</p>}
      {reviews.map(r => (
        <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
          <strong>{r.username}</strong> — Betyg: {r.rating}/5
          <p style={{ margin: '0.25rem 0 0' }}>{r.text}</p>
        </div>
      ))}
    </div>
  );
}