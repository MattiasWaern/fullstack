import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import BookCard from '../components/BookCard';
import BookSearch from '../components/BookSearch';
import WantToReadSidebar from '../components/WantToReadSidebar';
import ReadingTracker from "../components/ReadingTracker";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    api.get('/books').then(r => setBooks(r.data));
  }, []);

  async function addBook(bookData) {
    const { data } = await api.post('/books', bookData);
    setBooks(prev => [{ ...data, review_count: 0 }, ...prev]);
    setShowAdd(false);
  }

  const handleDeleteFromList = (bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(filter.toLowerCase()) ||
    b.author.toLowerCase().includes(filter.toLowerCase())
  );

  const totalReviews = books.reduce((sum, b) => sum + (b.review_count || 0), 0);

  const topRated = [...books]
    .filter(b => b.avg_rating)
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f9f8f4]">

      {/* HERO */}
      <div className="bg-[#382110] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="font-['Georgia',_serif] text-5xl font-bold mb-4 text-[#f4f1ea]">
              Välkommen till MyReads
            </h1>
            <p className="text-[#d4c5a9] text-xl mb-8 leading-relaxed">
              Upptäck böcker, dela recensioner & håll koll på vad du har läst
            </p>
            {isLoggedIn ? (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="bg-[#409D69] hover:bg-[#358558] text-white px-8 py-3 rounded-sm font-medium transition-colors text-lg shadow-lg"
              >
                {showAdd ? '✕ Stäng' : '+ Lägg till en bok'}
              </button>
            ) : (
              <Link
                to="/register"
                className="bg-[#409D69] hover:bg-[#358558] text-white px-8 py-3 rounded-sm font-medium transition-colors text-lg inline-block"
              >
                Skapa konto gratis
              </Link>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="max-w-4xl mx-auto -mt-8 px-4 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-[#d8d1c6]">
            <h2 className="font-['Georgia',_serif] font-bold text-[#382110] text-xl mb-4">
              Sök och lägg till böcker
            </h2>
            <BookSearch onSelect={addBook} />
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">

        {/* VÄNSTER - Want to Read */}
        <div className="flex-shrink-0">
          <WantToReadSidebar />
        </div>

        {/* MITTEN - Lästracker & Bokflöde */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* HÄR INTEGRERAR VI LÄSMÄTAREN PÅ STARTSIDAN */}
          <ReadingTracker />

          <div className="flex items-center justify-between mb-6 mt-2">
            <h2 className="font-['Georgia',_serif] text-2xl font-bold text-[#382110]">
              Alla böcker
              <span className="text-[#767676] text-lg font-normal ml-2">({filtered.length})</span>
            </h2>
            <input
              placeholder="Filtrera böcker..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-[#d8d1c6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#409D69] bg-white w-48 md:w-64"
            />
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-[#382110] font-medium">Inga böcker hittades</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} onDelete={handleDeleteFromList} />
            ))}
          </div>
        </div>

        {/* HÖGER - Stats & Topp */}
        <div style={{ width: '260px' }} className="flex-shrink-0 flex flex-col gap-4 w-full lg:w-auto">

          <div className="bg-white rounded-lg border border-[#d8d1c6] p-4 shadow-sm">
            <h3 className="font-['Georgia',_serif] font-bold text-[#382110] mb-3 border-b pb-2">Statistik</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#555]">Böcker:</span>
                <span className="font-bold">{books.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#555]">Recensioner:</span>
                <span className="font-bold">{totalReviews}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#d8d1c6] shadow-sm">
            <div className="p-4 border-b border-[#f0ece3]">
              <h3 className="font-['Georgia',_serif] font-bold text-[#382110]">Högst betyg</h3>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {topRated.length > 0 ? topRated.map((book, index) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="flex items-center gap-3 group hover:bg-[#f9f8f4] p-2 rounded-md transition-all -mx-2"
                >
                  <div className="relative flex-shrink-0">
                    {index === 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#e8871a] rounded-full flex items-center justify-center text-white text-xs z-10">
                        🏆
                      </span>
                    )}
                    <img
                      src={book.cover_url || 'https://via.placeholder.com/48x72'}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded-sm shadow-sm border border-[#e8e4d9]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#382110] group-hover:text-[#00635d] truncate">{book.title}</p>
                    <p className="text-xs text-[#767676] truncate">{book.author}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[#e8871a] text-xs">{'★'.repeat(Math.round(book.avg_rating))}</span>
                      <span className="text-[11px] text-[#767676] font-bold">{book.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-[#767676] text-center py-4 italic">Inga betyg än</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#d8d1c6] p-3 shadow-sm">
            <h3 className="font-['Georgia',_serif] text-xs font-bold text-[#382110] uppercase tracking-wider mb-3">Mina Genrer</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(books.map(b => b.genre).filter(Boolean).flatMap(g => g.split(/[, ]+/)))].slice(0, 10).map((g, i) => (
                <span key={i} className="bg-[#f4f1ea] text-[#382110] text-[10px] font-bold px-2 py-1 rounded border border-[#d8d1c6]">
                  {g}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      <footer className="bg-[#f4f1ea] border-t border-[#d8d1c6] mt-16 py-6 text-center text-sm text-[#767676]">
        © 2026 MyReads, Byggd för böcker 📚 xd
      </footer>
    </div>
  );
}