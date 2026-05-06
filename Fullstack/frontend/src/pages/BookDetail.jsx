import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from '../api';
import StarRating from "../components/StarRating";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(3);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    api.get(`/books/${id}`).then(r => setBook(r.data));
    api.get(`/books/${id}/reviews`).then(r => setReviews(r.data));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/reviews', { book_id: id, rating, text });
      setReviews(prev => [{ ...data, username }, ...prev]);
      setText('');
      setRating(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Något gick fel');
    }
  }

  async function deleteBook() {
    if (!window.confirm(`Är du säker på att du vill ta bort "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${id}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Kunde inte ta bort boken');
    }
  }

  if (!book) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#382110] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#767676] text-sm">Laddar...</p>
      </div>
    </div>
  );

  const isOwner = username === book.created_by_username;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
    : "0.00";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/" className="text-[#00635d] text-sm hover:underline">
          ← Tillbaka till böcker
        </Link>
      </div>

      {/* Book Header - Goodreads Style */}
      <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6 mb-8">
        <div className="flex gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <img
              src={book.cover_url || 'https://via.placeholder.com/120x180?text=Bok'}
              alt={book.title}
              className="w-32 h-48 object-cover rounded-sm shadow-[2px_2px_8px_rgba(0,0,0,0.15)]"
              onError={e => e.target.src = 'https://via.placeholder.com/120x180?text=Bok'}
            />
            
            {/* Goodreads-style "Want to Read" button */}
            <div className="mt-3 flex flex-col gap-2">
              {isOwner ? (
                <>
                  <button className="w-full bg-[#409D69] text-white text-sm font-medium px-3 py-1.5 rounded-sm hover:bg-[#358558] transition-colors">
                    Vill läsa ✓
                  </button>
                  <button
                    onClick={deleteBook}
                    className="w-full text-[#767676] text-xs hover:text-red-600 transition-colors border border-transparent hover:border-red-200 rounded-sm px-3 py-1"
                  >
                    Ta bort bok
                  </button>
                </>
              ) : (
                <button className="w-full bg-[#409D69] text-white text-sm font-medium px-3 py-1.5 rounded-sm hover:bg-[#358558] transition-colors">
                  Vill läsa
                </button>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-['Georgia',_'Times_New_Roman',_serif'] text-3xl font-bold text-[#382110] leading-tight">
                {book.title}
              </h1>
              {isOwner && (
                <button
                  onClick={deleteBook}
                  className="text-[#767676] hover:text-red-600 transition-colors flex-shrink-0"
                  title="Ta bort bok"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <p className="text-[#00635d] text-lg mt-1 hover:underline cursor-pointer">
              {book.author}
            </p>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={Math.round(parseFloat(avgRating))} size="lg" />
              <span className="text-lg font-medium text-[#382110]">{avgRating}</span>
              <span className="text-sm text-[#767676]">· {reviews.length} recensioner</span>
              {book.pages && (
                <span className="text-sm text-[#767676]">· {book.pages} sidor</span>
              )}
            </div>

            {/* Rating Distribution Bar (simplified) */}
            {reviews.length > 0 && (
              <div className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const percentage = (count / reviews.length) * 100;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-right text-[#767676]">{star} ★</span>
                      <div className="flex-1 h-2 bg-[#f0ece3] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#409D69] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-[#767676]">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Genre Tags */}
            {book.genre && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-block px-3 py-1 bg-[#f4f1ea] text-[#382110] text-sm rounded-full border border-[#d8d1c6] hover:bg-[#ede6d6] transition-colors cursor-pointer">
                  {book.genre}
                </span>
              </div>
            )}

            {/* Description */}
            {book.description && (
              <div className="mt-4 p-4 bg-white rounded border border-[#e8e4d9]">
                <h3 className="font-['Georgia',_'Times_New_Roman',_serif'] text-sm font-bold text-[#382110] mb-2">
                  Beskrivning
                </h3>
                <p className="text-sm text-[#555] leading-relaxed line-clamp-80">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Reviews Section */}
      <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Georgia',_'Times_New_Roman',_serif'] text-xl font-bold text-[#382110]">
            Recensioner
          </h2>
          <span className="text-sm text-[#767676]">
            Visar {reviews.length} recensioner
          </span>
        </div>

        {/* Write a Review - Goodreads Style */}
        {isLoggedIn ? (
          <form onSubmit={submitReview} className="bg-white rounded border border-[#e8e4d9] p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#f4f1ea] rounded-full flex items-center justify-center text-[#382110] font-medium">
                {username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#382110] text-sm">{username}</p>
                <p className="text-xs text-[#767676]">Skriv en recension</p>
              </div>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </p>
            )}
            
            <div className="mb-3">
              <p className="text-sm text-[#767676] mb-1">Ditt betyg:</p>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>
            
            <textarea
              placeholder="Vad tyckte du om boken?"
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={4}
              className="w-full border border-[#d8d1c6] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#409D69] focus:border-transparent mb-3 resize-none"
            />
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-[#409D69] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#358558] transition-colors"
              >
                Skicka recension
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#f4f1ea] rounded border border-[#d8d1c6] p-4 mb-6 text-center">
            <p className="text-sm text-[#382110] mb-2">
              Logga in för att skriva en recension
            </p>
            <Link 
              to="/login" 
              className="text-sm text-[#00635d] hover:underline font-medium"
            >
              Logga in →
            </Link>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-[#767676]">Inga recensioner än.</p>
            <p className="text-sm text-[#999] mt-1">Var först med att recensera!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(r => (
              <div 
                key={r.id} 
                className="bg-white border border-[#e8e4d9] rounded p-4 hover:border-[#d4c5a9] transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-[#f4f1ea] rounded-full flex items-center justify-center text-[#382110] font-medium flex-shrink-0">
                    {r.username?.[0]?.toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#382110] text-sm">
                        {r.username}
                      </span>
                      <span className="text-[#999] text-xs">·</span>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    
                    <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">
                      {r.text}
                    </p>
                    
                    {/* Review actions - Goodreads style */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f0ece3]">
                      <button className="text-xs text-[#767676] hover:text-[#382110] transition-colors">
                        👍 {Math.floor(Math.random() * 5)} gillar
                      </button>
                      <button className="text-xs text-[#767676] hover:text-[#382110] transition-colors">
                        💬 Kommentera
                      </button>
                      {r.username === username && (
                        <button className="text-xs text-[#767676] hover:text-red-600 transition-colors ml-auto">
                          🗑 Radera
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}