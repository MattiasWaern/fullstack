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
      <div className="min-h-screen bg-[#f4f1ea]">


        {/* HERO */}
        <div className="bg-[#382110] text-white py-12 px-6 text-center">
          <h1 className="text-4xl font-bold mb-2">Välkommen till MyReads</h1>
          <p className="text-[#e8d5b7] text-lg mb-6">Upptäck böcker, dela recensioner & håll koll på vad du har läst</p>
          {isLoggedIn && (
            <button onClick={() => setShowAdd(!showAdd)}
                    className="bg-[#e8871a] hover:bg-[#d4771a] text-white px-6 py-2 rounded-full font-mediu transition-colors "     
            >
              {showAdd ? 'Stäng' : '+ Lägg till en bok'}
            </button>
          )}
        </div>

        {/* Add book panel */}
        {showAdd &&(
          <div className="max-w-2xl mx-auto mt-6 px-4">
            <div className="bg-white rounded-xl shadow p-6 border border-[#d4c5a9]">
              <h2 className="font-semibold text-[#382110] text-lg mb-4">Sök och lägg till böcker</h2>
              <BookSearch onSelect={addBook}></BookSearch>
             </div> 
          </div>  
        )}

        {/* Main content */} 
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
          
        </div>

      </div>
  );
}