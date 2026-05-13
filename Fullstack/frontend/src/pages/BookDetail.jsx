import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from '../api';
import StarRating from "../components/StarRating";
import { useLocation } from "react-router-dom";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('edit') === 'true') {
    setIsEditing(true);
  }
}, [location]);
  
  // States
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [IsWantToRead, setIsWantToRead] = useState(false);
  
  // Form states
  const [rating, setRating] = useState(3);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    api.get(`/books/${id}`).then(r => {
      setBook(r.data);
      setEditData(r.data); // Förbered redigeringsdata
    });
    api.get(`/books/${id}/reviews`).then(r => setReviews(r.data));
  }, [id]);


  const toggleWantToRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try{
      if (IsWantToRead) {
        await api.delete(`/books/${book.id}/want-to-read`);
        setIsWantToRead(false);
      } else {
        await api.post(`/books/${book.id}/want-to-read`);
        setIsWantToRead(true);
      }
    } catch(err){
      console.error("Kunde inte uppdatera läslistan")
    }
  } 

  // Funktion för att spara uppdateringar
  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/books/${id}`, editData);
      setBook({ ...book, ...editData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Kunde inte uppdatera boken');
    }
  }

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
          
          {/* VÄNSTER KOLUMN */}
          <div className="w-full md:w-40 flex-shrink-0">
            <img
              src={book.cover_url || 'https://via.placeholder.com/150x225?text=Ingen+bild'}
              alt={book.title}
              className="w-full h-auto object-cover rounded shadow-md border border-gray-200"
            />
            
            <div className="mt-4 flex flex-col gap-2">
              <button className="w-full bg-[#409D69] text-white text-sm font-bold py-2 rounded shadow-sm hover:bg-[#358558]">
                Vill läsa
              </button>

              {/* KNAPPARNA VID TA BORT */}
              {isOwner && !isEditing && (
                <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[#ece8df]">
                  <button
                    onClick={() => { setIsEditing(true); setEditData(book); }}
                    className="w-full text-[#00635d] text-xs py-1.5 hover:bg-[#f4f1ea] rounded transition-colors border border-[#d8d1c6]"
                  >
                    Redigera info
                  </button>
                  <button
                    onClick={deleteBook}
                    className="w-full text-red-600 text-xs py-1.5 hover:bg-red-50 rounded transition-colors"
                  >
                    Ta bort bok
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* HÖGER KOLUMN */}
          <div className="flex-1">
            {isEditing ? (
              /* REDIGERINGSLÄGE */
              <form onSubmit={handleUpdate} className="space-y-4">
                <h2 className="text-lg font-bold text-[#382110] mb-4">Redigera bokdetaljer</h2>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400">Titel</label>
                  <input 
                    className="w-full border border-[#d8d1c6] p-2 rounded" 
                    value={editData.title} 
                    onChange={e => setEditData({...editData, title: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400">Författare</label>
                  <input 
                    className="w-full border border-[#d8d1c6] p-2 rounded" 
                    value={editData.author} 
                    onChange={e => setEditData({...editData, author: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Genre</label>
                    <input className="w-full border border-[#d8d1c6] p-2 rounded" value={editData.genre || ''} onChange={e => setEditData({...editData, genre: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Sidor</label>
                    <input type="number" className="w-full border border-[#d8d1c6] p-2 rounded" value={editData.page_count || ''} onChange={e => setEditData({...editData, page_count: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400">Beskrivning</label>
                  <textarea 
                    className="w-full border border-[#d8d1c6] p-2 h-32 rounded resize-both" 
                    value={editData.description || ''} 
                    onChange={e => setEditData({...editData, description: e.target.value})} 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-[#409D69] text-white px-6 py-2 rounded text-sm font-bold shadow-sm">Spara ändringar</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 text-sm hover:underline">Avbryt</button>
                </div>
              </form>
            ) : (
              /* VISNINGSLÄGE */
              <>
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

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
                  {book.genre && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Genre</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.genre.split(/[, ]+/).filter(Boolean).map((g, i) => (
                            <span key={i} className="bg-[#ece8df] text-[#382110] text-[11px] px-2 py-0.5 rounded-full border border-[#d8d1c6]">
                              {g}
                            </span>
                          ))}
                        </div>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* RECENSIONER */}
      <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6 shadow-sm">
        <h2 className="font-['Georgia',_serif] text-xl font-bold text-[#382110] mb-6">
          Community-recensioner
        </h2>
        {isLoggedIn ? (
          <form onSubmit={submitReview} className="bg-white border border-[#e8e4d9] p-5 rounded mb-8">
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
        ) : null}

        <div className="space-y-6">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-[#ece8df] last:border-0 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm text-[#382110]">{r.username}</span>
                <StarRating rating={r.rating} size="sm" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}