import { useState } from "react";

export default function BookSearch({onSelect}){
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

function cleanDescription(text) {
  if (!text) return '';
  // Ta bort marknadsföringsrader och trunkera
  const lines = text.split('\n').filter(line => 
    !line.includes('•') &&
    !line.includes('bestseller') &&
    !line.includes('Best Books') &&
    !line.includes('New York Times') &&
    !line.includes('Amazon') &&
    !line.includes('Apple') &&
    !line.includes('Barnes') &&
    !line.includes('Audible') &&
    !line.includes('Google Play') &&
    line.trim().length > 0
  );
  const clean = lines.join(' ').trim();
  return clean.length > 300 ? clean.slice(0, 300) + '...' : clean;
}


async function search() {
  if (!query.trim()) return;
  setLoading(true);
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&langRestrict=sv`);
    const data = await res.json();
    const items = (data.items || []).map(item => {
      const info = item.volumeInfo;
      return {
        id: item.id,
        title: info.title || '',
        author: info.authors?.join(', ') || 'Okänd',
        description: cleanDescription(info.description),
        cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
        genre: info.categories?.join(', ') || '',
      };
    });
    setResults(items);
  } catch (err) {
    console.error('Sökning misslyckades:', err);
  }
  setLoading(false);
}

     return (
    <div className="mb-6">
      <div className="flex gap-2 mb-3">
        <input
          placeholder="Sök efter en bok..."
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

      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
   {results.map(item => (
  <button
    key={item.id}
    onClick={() => {
      onSelect({
        title: item.title,
        author: item.author,
        description: item.description,
        cover_url: item.cover_url,
        genre: item.genre,
      });
      setResults([]);
      setQuery('');
    }}
    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#f4f1ea] border-b border-gray-100 last:border-0"
  >
    {item.cover_url && <img src={item.cover_url} alt={item.title} className="w-8 h-12 object-cover rounded" />}
    <div>
      <p className="font-medium text-sm text-[#382110]">{item.title}</p>
      <p className="text-xs text-gray-500">{item.author}</p>
    </div>
  </button>
))}
        </div>
      )}
    </div>
  );
}
