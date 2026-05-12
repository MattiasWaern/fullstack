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
      <div className="w-8 h-8 border-2 border-[#382110] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isOwner = username === book.created_by_username;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-[#00635d] text-sm hover:underline">
          ← Tillbaka till biblioteket
        </Link>
      </div>

      <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Vänster kolumn: Omslag och snabbknappar */}
          <div className="w-full md:w-40 flex-shrink-0">
            <img
              src={book.cover_url || 'https://via.placeholder.com/150x225?text=Ingen+bild'}
              alt={book.title}
              className="w-full h-auto object-cover rounded shadow-md border border-gray-200"
            />
            
            <div className="mt-4 space-y-2">
              <button className="w-full bg-[#409D69] text-white text-sm font-bold py-2 rounded shadow-sm hover:bg-[#358558]">
                Vill läsa
              </button>
              {isOwner && (
                <button
                  onClick={deleteBook}
                  className="w-full text-red-600 text-xs py-2 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-100"
                >
                  Ta bort från systemet
                </button>
              )}
            </div>
          </div>

          {/* Höger kolumn: Information */}
          <div className="flex-1">
            <h1 className="font-['Georgia',_serif] text-3xl font-bold text-[#382110] mb-1">
              {book.title}
            </h1>
            <p className="text-xl text-[#00635d] mb-4 italic">av {book.author}</p>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#ece8df]">
              <StarRating rating={Math.round(parseFloat(avgRating))} size="lg" />
              <span className="text-xl font-bold text-[#382110]">{avgRating}</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">{reviews.length} betyg</span>
            </div>

            {/* Bokfakta Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
              {book.genre && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Genre</p>
                  <p className="text-sm text-[#382110]">{book.genre}</p>
                </div>
              )}
              {book.page_count && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Format</p>
                  <p className="text-sm text-[#382110]">{book.page_count} sidor</p>
                </div>
              )}
              {book.release_year && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Publicerad</p>
                  <p className="text-sm text-[#382110]">{book.release_year} {book.publisher ? `av ${book.publisher}` : ''}</p>
                </div>
              )}
              {book.isbn && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ISBN</p>
                  <p className="text-sm text-[#382110]">{book.isbn}</p>
                </div>
              )}
            </div>

            {book.description && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <h3 className="text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest">Beskrivning</h3>
                <p>{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recensionssektion */}
      <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6 shadow-sm">
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-[#382110] mb-6">
          Community-recensioner
        </h2>

        {isLoggedIn ? (
          <form onSubmit={submitReview} className="bg-white border border-[#e8e4d9] p-5 rounded mb-8">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-[#382110] text-white rounded-full flex items-center justify-center text-xs">
                 {username?.[0].toUpperCase()}
               </div>
               <span className="text-sm font-bold text-[#382110]">{username}</span>
             </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ditt betyg</label>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>

            <textarea
              placeholder="Skriv vad du tyckte om boken..."
              value={text}
              onChange={e => setText(e.target.value)}
              required
              className="w-full border border-[#d8d1c6] rounded p-3 text-sm focus:ring-1 focus:ring-[#409D69] outline-none min-h-[100px] mb-4"
            />
            <button type="submit" className="bg-[#382110] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#4a2f1a]">
              Posta recension
            </button>
          </form>
        ) : (
          <div className="text-center p-8 border border-dashed border-[#d8d1c6] rounded mb-8 bg-[#f9f8f6]">
            <p className="text-sm text-gray-500">Vill du tycka till? <Link to="/login" className="text-[#00635d] font-bold hover:underline">Logga in</Link> för att skriva en recension.</p>
          </div>
        )}

        <div className="space-y-6">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-[#ece8df] last:border-0 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm text-[#382110]">{r.username}</span>
                <span className="text-gray-300 text-xs">•</span>
                <StarRating rating={r.rating} size="sm" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{r.text}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">Inga recensioner än. Bli den första att skriva en!</p>
          )}
        </div>
      </div>
    </div>
  );
}