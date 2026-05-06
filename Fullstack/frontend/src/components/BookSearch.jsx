import { useState } from "react";
import { useBookSearch } from "../hooks/useBookSearch";

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useBookSearch(query);

  return (
    <div className="mb-6">
      <input
        placeholder="Sök efter en bok..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
      />

      {loading && <p className="text-sm mt-2">Söker...</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg mt-3 overflow-hidden shadow-sm">
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#f4f1ea] border-b last:border-0"
            >
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="w-8 h-12 object-cover rounded"
                />
              )}
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