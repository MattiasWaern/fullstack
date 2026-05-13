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
        .catch(console.error);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn || books.length === 0) return null;

  return (
    <div style={{ width: '240px' }} className="bg-white rounded-lg border border-[#d8d1c6] shadow-md">
      <div className="px-4 py-3 border-b border-[#f0ece3] bg-[#fcfaf7]">
        <h3 className="font-['Georgia',_serif] font-bold text-[#382110] text-lg">Want to Read</h3>
      </div>
      <div className="p-4 flex flex-col gap-6">
        {books.map(book => (
          <Link key={book.id} to={`/books/${book.id}`} className="group flex flex-col gap-2">
<img
  src={book.cover_url || 'https://via.placeholder.com/200x300'}
  alt={book.title}
  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
  className="rounded shadow-md group-hover:opacity-90 transition-opacity"
/>       <p className="text-xl font-bold text-[#382110] group-hover:text-[#409D69] leading-snug">
              {book.title}
            </p>
            <p className="text-xs text-[#767676] italic">av {book.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}