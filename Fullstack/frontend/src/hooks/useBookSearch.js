import { useState, useEffect } from "react";

export function useBookSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function cleanDescription(text) {
    if (!text) return '';

    const blacklist = [
      'bestseller', 'amazon', 'apple', 'barnes',
      'audible', 'google play', 'new york times'
    ];

    const lines = text.split('\n').filter(line =>
      !blacklist.some(word =>
        line.toLowerCase().includes(word)
      ) && line.trim().length > 0
    );

    const clean = lines.join(' ').trim();
    return clean.length > 300 ? clean.slice(0, 300) + '...' : clean;
  }

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`
        );

        if (!res.ok) throw new Error('API error');

        const data = await res.json();

        const items = (data.items || []).map(item => {
          const info = item.volumeInfo;

          return {
            id: item.id,
            title: info.title || '',
            author: info.authors?.join(', ') || 'Okänd',
            description: cleanDescription(info.description),
            cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
            genre: info.categories?.join(', ') || '',
          };
        });

        setResults(items);
      } catch (err) {
        setError('Kunde inte hämta böcker');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce (0.4s)

    return () => clearTimeout(delay);
  }, [query]);

  return { results, loading, error };
}