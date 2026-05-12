import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import BookCard from '../components/BookCard';
import BookSearch from '../components/BookSearch';

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

  // FUNKTION FÖR ATT UPPDATERA LISTAN NÄR EN BOK TAS BORT
  const handleDeleteFromList = (bookId) => {
    setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(filter.toLocaleLowerCase()) ||
    b.author.toLocaleLowerCase().includes(filter.toLowerCase())
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
        <div className="max-w-6xl mx-auto px-4 py-16">
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

      {/* Add book panel */}
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

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Georgia',_serif] text-2xl font-bold text-[#382110]">
              Alla böcker
              <span className="text-[#767676] text-lg font-normal ml-2">
                ({filtered.length})
              </span>
            </h2>

            <div className="relative">
              <input
                placeholder="Filtrera böcker..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="border border-[#d8d1c6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#409D69] bg-white w-64"
              />
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-[#382110] font-medium">Inga böcker hittades</p>
            </div>
          )}

          {/* BOOK GRID - Här skickas onDelete med! */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onDelete={handleDeleteFromList} 
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          {/* Statistik Card */}
          <div className="bg-white rounded-lg border border-[#d8d1c6] mb-4 p-4">
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

          {/* Top Rated Card */}
          <div className="bg-white rounded-lg border border-[#d8d1c6] mb-4 p-4">
            <h3 className="font-['Georgia',_serif] font-bold text-[#382110] mb-3 border-b pb-2">Högst betyg</h3>
            {topRated.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`} className="flex items-center gap-2 mb-3 group">
                <img src={book.cover_url} className="w-8 h-12 object-cover rounded shadow-sm" alt="" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate group-hover:text-[#00635d]">{book.title}</p>
                  <p className="text-[10px] text-[#e8871a]">{'★'.repeat(Math.round(book.avg_rating))}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Genrer Card */}
          <div className="bg-white rounded-lg border border-[#d8d1c6] p-3">
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
        © 2024 MyReads — Byggd med kärlek för böcker 📚
      </footer>
    </div>
  );
}