import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import BookCard from '../components/BookCard';
import BookSearch from '../components/BookSearch';

export default function Home(){
    const [books, setBooks] = useState([]);
    const [filter, setFilter] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const isLoggedIn = !!localStorage.getItem('token');
    
    useEffect(() => {api.get('/books').then(r => setBooks(r.data));}, []);

    async function addBook(bookData) {
    const { data } = await api.post('/books', bookData);
    setBooks(prev => [{ ...data, review_count: 0 }, ...prev]);
    setShowAdd(false)
  }

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

        {/* HERO - Goodreads Style */}
        <div className="bg-[#382110] text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="max-w-2xl">
              <h1 className="font-['Georgia',_'Times_New_Roman',_serif'] text-5xl font-bold mb-4 text-[#f4f1ea]">
                Välkommen till MyReads
              </h1>
              <p className="text-[#d4c5a9] text-xl mb-8 leading-relaxed">
                Upptäck böcker, dela recensioner & håll koll på vad du har läst
              </p>
              {isLoggedIn ? (
                <button 
                  onClick={() => setShowAdd(!showAdd)}
                  className="bg-[#409D69] hover:bg-[#358558] text-white px-8 py-3 rounded-sm font-medium transition-colors text-lg shadow-lg hover:shadow-xl"
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
              <h2 className="font-['Georgia',_'Times_New_Roman',_serif'] font-bold text-[#382110] text-xl mb-4">
                Sök och lägg till böcker
              </h2>
              <BookSearch onSelect={addBook} />
            </div>
          </div>
        )}

        {/* Main content */} 
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
          {/* Book grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Georgia',_'Times_New_Roman',_serif'] text-2xl font-bold text-[#382110]">
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
                  className="border border-[#d8d1c6] rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#409D69] focus:border-transparent bg-white w-64"
                />
                <svg 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl text-[#382110] font-medium mb-2">
                  Inga böcker hittades
                </p>
                <p className="text-[#767676]">
                  {filter ? 'Testa ett annat sökord' : 'Var först med att lägga till en bok!'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </div>

          {/* Sidebar - Goodreads Style */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            {/* Statistics Card */}
            <div className="bg-white rounded-lg border border-[#d8d1c6] mb-4">
              <div className="p-4 border-b border-[#f0ece3]">
                <h3 className="font-['Georgia',_'Times_New_Roman',_serif'] font-bold text-[#382110]">
                   Statistik
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#555]">Antal böcker</span>
                    <span className="font-medium text-[#382110] bg-[#f4f1ea] px-3 py-1 rounded-sm">
                      {books.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#555]">Recensioner</span>
                    <span className="font-medium text-[#382110] bg-[#f4f1ea] px-3 py-1 rounded-sm">
                      {totalReviews}
                    </span>
                  </div>
                  {books.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#555]">Snittbetyg</span>
                      <span className="font-medium text-[#382110] bg-[#f4f1ea] px-3 py-1 rounded-sm">
                        {(books.reduce((sum, b) => sum + (b.avg_rating || 0), 0) / books.length).toFixed(1)} ★
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Rated Card */}
            <div className="bg-white rounded-lg border border-[#d8d1c6] mb-4">
              <div className="p-4 border-b border-[#f0ece3]">
                <h3 className="font-['Georgia',_'Times_New_Roman',_serif'] font-bold text-[#382110]">
                   Högst betyg
                </h3>
              </div>
              <div className="p-4">
                {topRated.length > 0 ? (
                  <div className="space-y-3">
                    {topRated.map((book, index) => (
                      <Link 
                        key={book.id} 
                        to={`/books/${book.id}`}
                        className="flex items-center gap-3 group hover:bg-[#f9f8f4] p-2 rounded transition-colors -mx-2"
                      >
                        <div className="relative">
                          {index === 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e8871a] rounded-full flex items-center justify-center text-white text-xs">
                              🏆
                            </span>
                          )}
                          <img
                            src={book.cover_url || 'https://via.placeholder.com/32x48?text=Bok'}
                            alt={book.title}
                            className="w-8 h-12 object-cover rounded-sm shadow-sm"
                            onError={e => e.target.src = 'https://via.placeholder.com/32x48?text=Bok'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#382110] group-hover:text-[#00635d] transition-colors leading-tight truncate">
                            {book.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[#e8871a] text-xs">
                              {'★'.repeat(Math.round(book.avg_rating))}
                            </span>
                            <span className="text-xs text-[#767676]">
                              {book.avg_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#767676] text-center py-4">
                    Inga betyg än
                  </p>
                )}
              </div>
            </div>

            {/* Genres Card */}
            <div className="bg-white rounded-lg border border-[#d8d1c6]">
              <div className="p-4 border-b border-[#f0ece3]">
                <h3 className="font-['Georgia',_'Times_New_Roman',_serif'] font-bold text-[#382110]">
                   Genrer
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {[...new Set(books.map(b => b.genre).filter(Boolean))]
                    .slice(0, 8)
                    .map(genre => (
                      <span 
                        key={genre}
                        className="text-xs px-3 py-1 bg-[#f4f1ea] text-[#382110] rounded-full border border-[#d8d1c6] cursor-pointer hover:bg-[#ede6d6] transition-colors"
                        onClick={() => setFilter(genre)}
                      >
                        {genre}
                      </span>
                    ))}
                  {books.filter(b => b.genre).length === 0 && (
                    <p className="text-sm text-[#767676]">Inga genrer än</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#f4f1ea] border-t border-[#d8d1c6] mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <p className="text-sm text-[#767676]">
              © 2024 MyReads — Byggd med kärlek för böcker 📚
            </p>
          </div>
        </footer>
      </div>
  );
}