import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import StarRating from "../components/StarRating";

export default function Profile() {
  const [reviews, setReviews] = useState([]);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // States för redigering av specifik recension
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(3);

  const fetchMyReviews = () => {
    if (!username) { navigate('/login'); return; }
    api.get('/reviews/mine').then(r => setReviews(r.data));
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Vill du ta bort den här recensionen?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert("Kunde inte ta bort recensionen");
    }
  }

  async function handleUpdateReview(reviewId) {
    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editReviewRating,
        text: editReviewText
      });
      setEditingReviewId(null);
      fetchMyReviews(); 
    } catch (err) {
      alert("Kunde inte uppdatera recensionen");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-[#382110] text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#382110] text-2xl font-bold">
          {username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-[#e8d5b7] text-sm">{reviews.length} recensioner</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[#382110] mb-4">Mina recensioner</h2>

      {reviews.length === 0 && <p className="text-gray-400">Du har inte skrivit några recensioner än.</p>}
      
      <div className="flex flex-col gap-4">
        {reviews.map(r => {
          const isCurrentlyEditing = editingReviewId === r.id;

          return (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
              
              
              <div className="flex gap-4 flex-1 items-start min-w-0">
                <Link to={`/books/${r.book_id}`} className="flex-shrink-0">
                  <img
                    src={r.cover_url || `https://covers.openlibrary.org/b/id/1-M.jpg`}
                    alt={r.book_title}
                    className="w-12 h-18 object-cover rounded shadow-sm hover:opacity-80 transition-opacity"
                    onError={e => e.target.src = 'https://via.placeholder.com/48x72?text=Bok'}
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${r.book_id}`} className="font-semibold text-[#382110] hover:underline block truncate">
                    {r.book_title}
                  </Link>

                  {isCurrentlyEditing ? (
                    <div className="mt-2 space-y-2 bg-[#fdfbf7] p-3 rounded border border-gray-100">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Betyg</label>
                        <StarRating rating={editReviewRating} onRate={setEditReviewRating} size="sm" />
                      </div>
                      <textarea
                        value={editReviewText}
                        onChange={e => setEditReviewText(e.target.value)}
                        className="w-full border border-[#d8d1c6] p-2 text-sm rounded bg-white outline-none focus:ring-1 focus:ring-[#409D69]"
                      />
                      <div className="flex gap-2 justify-end text-xs">
                        <button onClick={() => setEditingReviewId(null)} className="px-2 py-1 border border-gray-300 rounded text-gray-600 bg-white">
                          Avbryt
                        </button>
                        <button onClick={() => handleUpdateReview(r.id)} className="px-2 py-1 bg-[#409D69] text-white rounded font-bold">
                          Spara
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="my-1">
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <p className="text-gray-600 text-sm italic">"{r.text}"</p>
                    </>
                  )}
                </div>
              </div>

              {!isCurrentlyEditing && (
                <div className="flex md:flex-col gap-3 md:gap-1 text-xs self-end md:self-start flex-shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => {
                      setEditingReviewId(r.id);
                      setEditReviewText(r.text);
                      setEditReviewRating(r.rating);
                    }}
                    className="text-[#00635d] hover:underline font-medium px-2 py-1 md:p-0 bg-gray-50 md:bg-transparent rounded"
                  >
                    Redigera
                  </button>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="text-red-600 hover:underline font-medium px-2 py-1 md:p-0 bg-gray-50 md:bg-transparent rounded"
                  >
                    Ta bort
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}