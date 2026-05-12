import { useState } from "react";
import api from '../api';
import AddManualBook from "./AddManualBook"; // VIKTIGT: Kontrollera att denna fil finns!

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("title");
  const [showManualForm, setShowManualForm] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // 1. Sök lokalt
      const localRes = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      
      // 2. Sök externt (Hybrid)
      const field = searchType === 'author' ? 'author' : 'title';
      const olRes = await fetch(`https://openlibrary.org/search.json?${field}=${encodeURIComponent(query)}&limit=6`);
      const olData = await olRes.json();
      
      const olBooks = (olData.docs || []).map(book => ({
        id: book.key, // Temporärt ID
        title: book.title,
        author: book.author_name?.join(', ') || 'Okänd',
        cover_url: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        isbn: book.isbn?.[0] || '',
        isExternal: true 
      }));

      // Filtrera bort dubbletter om boken redan finns lokalt
      const localTitles = localRes.data.map(b => b.title.toLowerCase());
      const uniqueOlBooks = olBooks.filter(b => !localTitles.includes(b.title.toLowerCase()));

      setResults([...localRes.data, ...uniqueOlBooks]);
    } catch (err) {
      console.error('Sökningen misslyckades:', err);
    } finally {
      setLoading(false);
    }
  }

  // Om användaren vill lägga till manuellt
  if (showManualForm) {
    return (
      <AddManualBook 
        initialTitle={query} 
        onCancel={() => setShowManualForm(false)} 
        onSave={(data) => {
          onSelect(data); 
          setShowManualForm(false);
          setQuery('');
          setResults([]);
        }}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Sökfältet - Detta är vad som saknas på din bild! */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Sök efter titel eller författare..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          className="flex-1 border border-[#d8d1c6] rounded px-4 py-2 focus:ring-2 focus:ring-[#409D69] outline-none"
        />
        <button 
          onClick={search} 
          className="bg-[#382110] text-white px-6 py-2 rounded hover:bg-[#4a2f1a]"
        >
          {loading ? 'Söker...' : 'Sök'}
        </button>
      </div>

      {/* Resultatlista */}
      {results.length > 0 && (
        <div className="bg-white border border-[#d8d1c6] rounded shadow-inner max-h-96 overflow-y-auto">
          {results.map(item => (
            <button 
              key={item.id} 
              onClick={() => { onSelect(item); setResults([]); setQuery(''); }}
              className="flex items-center gap-4 w-full p-3 hover:bg-[#f4f1ea] border-b border-[#f0ece3] last:border-0"
            >
              <img 
                src={item.cover_url || 'https://via.placeholder.com/40x60?text=Bok'} 
                className="w-10 h-14 object-cover rounded shadow-sm"
                alt=""
              />
              <div className="text-left">
                <p className="font-bold text-[#382110] text-sm">{item.title}</p>
                <p className="text-xs text-[#767676]">{item.author}</p>
                {item.isExternal && <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 rounded mt-1 inline-block">Från webben</span>}
              </div>
            </button>
          ))}
          <button 
            onClick={() => setShowManualForm(true)}
            className="w-full py-3 text-sm text-[#409D69] font-bold hover:bg-[#f0f9f4] border-t border-[#d8d1c6]"
          >
            + Hittar du inte boken? Lägg till manuellt
          </button>
        </div>
      )}
    </div>
  );
}