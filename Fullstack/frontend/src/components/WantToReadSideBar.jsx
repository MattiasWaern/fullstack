import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';

export default function WantToReadSidebar() {
  const [books, setBooks] = useState([]);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/books/my/want-to-read')
        .then(r => setBooks(r.data))
        .catch(err => console.error(err))
    }
  }, [isLoggedIn]);

  if (!isLoggedIn || books.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-[#d8d1c6] p-5 shadow-sm mb-6">
      <h3 className="font-['Georgia',_serif] font-bold text-[#382110] mb-4 border-b border-[#ece8df] pb-2 text-base tracking-wide">
        WANT TO READ
      </h3>
      
      <div className="space-y-5">
        {books.slice(0, 5).map(book => (
          <Link key={book.id} to={`/books/${book.id}`} className="flex gap-3 group items-start">
            {/* Större bild med bättre skärpa */}
            <div className="flex-shrink-0">
              <img 
                src={book.cover_url || 'https://via.placeholder.com/60x90?text=Bok'} 
                className="w-14 h-20 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow border border-[#e8e4d9]" 
                alt={book.title} 
              />
            </div>
            
            <div className="min-w-0 pt-1">
              {/* Större och tydligare titel */}
              <p className="text-sm font-bold text-[#382110] leading-tight group-hover:text-[#00635d] line-clamp-2">
                {book.title}
              </p>
              {/* Lagom stor författartext */}
              <p className="text-xs text-gray-500 mt-1 truncate">
                av {book.author}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {books.length > 5 && (
        <Link 
          to="/my-shelf" 
          className="block mt-5 pt-3 border-t border-[#f4f1ea] text-xs font-bold text-[#00635d] hover:underline text-center"
        >
          Visa hela din bokhylla ({books.length} böcker)
        </Link>
      )}
    </div>
  ); 
}