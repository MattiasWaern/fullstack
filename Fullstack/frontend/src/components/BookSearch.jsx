import { useState } from "react";

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      // Gör tre olika sökningar för bästa täckning
      const queries = [
        // Exakt fras-sökning (för hela titlar)
        fetch(
          `https://www.googleapis.com/books/v1/volumes?q="${encodeURIComponent(
            query
          )}"&maxResults=8&langRestrict=en&orderBy=relevance&printType=books`
        ),
        // Generell sökning (fångar det mesta)
        fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
          )}&maxResults=8&langRestrict=en&orderBy=relevance&printType=books`
        ),
        // Titelsökning
        fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
            query
          )}&maxResults=8&langRestrict=en&orderBy=relevance&printType=books`
        )
      ];

      const responses = await Promise.all(queries);
      const dataArrays = await Promise.all(responses.map(r => r.json()));

      // Kombinera alla resultat
      const allItems = dataArrays.flatMap(data => data.items || []);
      
      // Ta bort dubbletter baserat på id
      const uniqueItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );

      const items = uniqueItems
        .map((item) => {
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
          
          // Mer flexibel matchning - minst hälften av orden ska matcha
          const matchingTerms = searchTerms.filter(term => 
            titleLower.includes(term) || authorLower.includes(term)
          );
          
          // Kräv att minst hälften av söktermerna matchar
          return matchingTerms.length >= Math.ceil(searchTerms.length / 2);
        }) || [];

      // Sortera efter relevans - titlar som innehåller hela frasen först
      const sortedItems = items.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      });

      setResults(sortedItems.slice(0, 6));
    } catch (error) {
      console.error("Sökningen misslyckades:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
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
        <div className="text-sm text-gray-500 mt-2">
          <p>Inga resultat hittades för "{query}"</p>
          <p className="text-xs mt-1">Tips: Testa att söka på delar av titeln eller författarens namn</p>
        </div>
      )}
    </div>
  );
}