import { useState } from "react";
import api from '../api';

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("title"); // "title" | "author"

async function search() {
  if (!query.trim()) return;
  setLoading(true);
  try {
    const { data } = await api.get(`/books/search?q=${encodeURIComponent(query)}&type=${searchType}`);
    const sorted = data.sort((a, b) => {
      const queryLower = query.toLowerCase();
      const aMatch = searchType === 'author'
        ? a.author.toLowerCase().includes(queryLower)
        : a.title.toLowerCase().includes(queryLower);
      const bMatch = searchType === 'author'
        ? b.author.toLowerCase().includes(queryLower)
        : b.title.toLowerCase().includes(queryLower);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    setResults(sorted.slice(0, 8));
  } catch (err) {
    console.error('Sökningen misslyckades:', err);
    setResults([]);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="mb-6">
      {/* Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setSearchType('title'); setResults([]); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            searchType === 'title'
              ? 'bg-[#382110] text-white'
              : 'bg-white text-[#382110] border border-[#382110] hover:bg-[#f4f1ea]'
          }`}
        >
          📖 Boktitel
        </button>
        <button
          onClick={() => { setSearchType('author'); setResults([]); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            searchType === 'author'
              ? 'bg-[#382110] text-white'
              : 'bg-white text-[#382110] border border-[#382110] hover:bg-[#f4f1ea]'
          }`}
        >
          ✍️ Författare
        </button>
      </div>

      {/* Sökfält */}
      <div className="flex gap-2 mb-3">
        <input
          placeholder={searchType === 'author' ? 'Sök efter författare...' : 'Sök efter boktitel...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
        />
        <button
          onClick={search}
          className="bg-[#382110] text-white px-4 py-2 rounded text-sm hover:bg-[#4a2f1a]"
        >
          {loading ? '...' : 'Sök'}
        </button>
      </div>

      {/* Resultat */}
      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                setResults([]);
                setQuery('');
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#f4f1ea] border-b border-gray-100 last:border-0"
            >
              {item.cover_url
                ? <img src={item.cover_url} alt={item.title} className="w-8 h-12 object-cover rounded flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                : <div className="w-8 h-12 bg-gray-200 rounded flex-shrink-0" />
              }
              <div>
                <p className="font-medium text-sm text-[#382110]">{item.title}</p>
                <p className="text-xs text-gray-500">{item.author}</p>
                {item.genre && <p className="text-xs text-[#e8871a] mt-0.5">{item.genre}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <p className="text-sm text-gray-400 mt-2">Inga resultat för "{query}"</p>
      )}
    </div>
  );
}