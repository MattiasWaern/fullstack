import { useState } from "react";

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);

    // Simple general search without quotes
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=15&langRestrict=en&orderBy=relevance&printType=books`
    );

    const data = await res.json();

    const items = data.items
      ?.map((item) => {
        const b = item.volumeInfo;

        return {
          id: item.id,
          title: b.title || "Okänd titel",
          author: b.authors?.join(", ") || "Okänd",
          description: b.description || "",
          pages: b.pageCount || "",
          genre: b.categories?.[0] || "",
          cover_url: b.imageLinks?.thumbnail || "",
        };
      })
      .filter((book) => {
        const queryLower = query.toLowerCase();
        const titleLower = book.title.toLowerCase();
        const authorLower = book.author.toLowerCase();
        const searchTerms = queryLower.split(" ");
        
        // Check if query matches title OR author
        const titleMatch = searchTerms.every(term => titleLower.includes(term));
        const authorMatch = searchTerms.every(term => authorLower.includes(term));
        
        return titleMatch || authorMatch;
      }) || [];

    // Remove duplicates based on title and author combination
    const uniqueItems = items.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.title === item.title && t.author === item.author
      ))
    );

    setResults(uniqueItems.slice(0, 6));
    setLoading(false);
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-3">
        <input
          placeholder="Sök efter bok eller författare..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
        />

        <button
          onClick={search}
          className="bg-[#382110] text-white px-4 py-2 rounded text-sm hover:bg-[#4a2f1a]"
        >
          {loading ? "..." : "Sök"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                setResults([]);
                setQuery("");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#f4f1ea] border-b border-gray-100 last:border-0"
            >
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="w-8 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div>
                <p className="font-medium text-sm text-[#382110]">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.author}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {results.length === 0 && !loading && query && (
        <p className="text-sm text-gray-500 mt-2">Inga resultat hittades</p>
      )}
    </div>
  );
}