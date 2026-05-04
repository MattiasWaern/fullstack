import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import StarRating from "../components/StarRating";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(3);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    api.get(`/books/${id}`).then(r => setBook(r.data));
    api.get(`/books/${id}/reviews`).then(r => setReviews(r.data));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/reviews', { book_id: id, rating, text });
      setReviews(prev => [{ ...data, username: localStorage.getItem('username') }, ...prev]);
      setText('');
      setRating(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Något gick fel');
    }
  }

  if (!book) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-400">Laddar...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-6 mb-8">
        <img
          src={book.cover_url || 'https://via.placeholder.com/120x180?text=Bok'}
          alt={book.title}
          className="w-28 h-44 object-cover rounded shadow-md flex-shrink-0"
          onError={e => e.target.src = 'https://via.placeholder.com/120x180?text=Bok'}
        />
        <div>
          <h1 className="text-3xl font-bold text-[#382110]">{book.title}</h1>
          <p className="text-gray-500 mt-1">{book.author}</p>
          {book.description && (
            <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-4">{book.description}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-[#382110] mb-4">Recensioner ({reviews.length})</h2>

        {isLoggedIn && (
          <form onSubmit={submitReview} className="bg-[#f4f1ea] rounded-lg p-4 mb-6 border border-[#d4c5a9]">
            <h3 className="font-medium text-[#382110] mb-3">Skriv en recension</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Betyg:</p>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>
            <textarea
              placeholder="Vad tyckte du om boken?"
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110] mb-3"
            />
            <button type="submit" className="bg-[#382110] text-white px-4 py-2 rounded text-sm hover:bg-[#4a2f1a]">
              Skicka recension
            </button>
          </form>
        )}

        {reviews.length === 0 && <p className="text-gray-400">Inga recensioner än — var först!</p>}
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#382110]">👤 {r.username}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}