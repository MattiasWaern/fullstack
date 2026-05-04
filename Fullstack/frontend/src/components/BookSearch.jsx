import { useState } from "react";

export default function BookSearch({onSelect}){
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] =(false);

    async function search(){
        if(!query.trim()) return;
        setLoading(true);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`);
        const data = await res.json();
        setResults(data.items || []);
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
          {results.map(item => {
            const info = item.volumeInfo;
            const cover = info.imageLinks?.thumbnail;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect({
                    title: info.title,
                    author: info.authors?.join(', ') || 'Okänd',
                    description: info.description || '',
                    cover_url: cover || '',
                  });
                  setResults([]);
                  setQuery('');
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#f4f1ea] border-b border-gray-100 last:border-0"
              >
                {cover && <img src={cover} alt={info.title} className="w-8 h-12 object-cover rounded" />}
                <div>
                  <p className="font-medium text-sm text-[#382110]">{info.title}</p>
                  <p className="text-xs text-gray-500">{info.authors?.join(', ')}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
