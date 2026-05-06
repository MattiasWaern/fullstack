import { useEffect, useState } from "react";
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

   return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#382110] mb-2">Upptäck böcker</h1>
      <p className="text-gray-500 mb-6">Läs och dela recensioner med andra</p>

      {isLoggedIn && (
        <div className="bg-[#f4f1ea] rounded-lg p-4 mb-8 border border-[#d4c5a9]">
          <h2 className="font-semibold text-[#382110] mb-3">➕ Lägg till en bok</h2>
          <BookSearch onSelect={addBook} />
        </div>
      )}

      <div className="mb-4">
        <input
          placeholder="Filtrera böcker..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8">Inga böcker hittades.</p>}
        {filtered.map(book => <BookCard key={book.id} book={book} />)}
      </div>
    </div>
  );
}