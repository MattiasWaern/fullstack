import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import StarRating from "../components/StarRating";

export default function Profile() {
  const [reviews, setReviews] = useState([]);
  const [wantToReadBooks, setWantToReadBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews'); 
  
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // States för redigering av specifik recension
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(3);

  const fetchData = () => {
    if (!username) { navigate('/login'); return; }
    
    
    api.get('/reviews/mine')
      .then(r => setReviews(r.data))
      .catch(err => console.error("Kunde inte hämta recensioner", err));

    
    api.get('/books/my/want-to-read')
      .then(r => setWantToReadBooks(r.data))
      .catch(err => console.error("Kunde inte hämta läslista", err));
  };

  useEffect(() => {
    fetchData();
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
      fetchData(); // Ladda om all data
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
          <p className="text-[#e8d5b7] text-sm">
            {reviews.length} recenserade | {wantToReadBooks.length} i läslistan
          </p>
        </div>
      </div>

      
      <div className="flex border-b border-[#d8d1c6] mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2 px-4 font-medium text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-[#382110] text-[#382110] font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Mina recensioner ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('wantToRead')}
          className={`py-2 px-4 font-medium text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'wantToRead'
              ? 'border-[#382110] text-[#382110] font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Want to Read ({wantToReadBooks.length})
        </button>
      </div>

      
      
      
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-4">
          {reviews.length === 0 ? (
            <p className="text-gray-400 italic">Du har inte skrivit några recensioner än.</p>
          ) : (
            reviews.map(r => {
              const isCurrentlyEditing = editingReviewId === r.id;
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="flex gap-4 flex-1 items-start min-w-0">
                    <Link to={`/books/${r.book_id}`} className="flex-shrink-0">
                      <img
                        src={r.cover_url || 'https://via.placeholder.com/48x72?text=Bok'}
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
            })
          )}
        </div>
      )}

      
      {activeTab === 'wantToRead' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {wantToReadBooks.length === 0 ? (
            <p className="text-gray-400 italic col-span-full">Din läslista är tom.</p>
          ) : (
            wantToReadBooks.map(book => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col justify-between">
                <Link to={`/books/${book.id}`} className="group flex flex-col gap-2">
                  <img
                    src={book.cover_url || 'https://via.placeholder.com/150x225?text=Ingen+bild'}
                    alt={book.title}
                    className="w-full h-full object-cover rounded shadow-sm group-hover:opacity-90 transition-opacity"
                  /> 
                  <div>
                    <p className="font-bold text-[#382110] text-sm line-clamp-1 group-hover:text-[#409D69]">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">av {book.author}</p>
                  </div>
                </Link>
                
                
                <Link 
                  to={`/books/${book.id}`}
                  className="mt-3 block text-center text-xs bg-[#f4f1ea] border border-[#d8d1c6] text-[#382110] py-1 rounded hover:bg-[#ece8df] transition-colors font-medium"
                >
                  Skriv recension
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}