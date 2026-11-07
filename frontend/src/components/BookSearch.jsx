
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import AddManualBook from "./AddManualBook";
import "../styles/BookForms.css";

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    const term = query.trim();
    if (!term || loading) return;

    setLoading(true);
    setError("");
    setSearched(false);
    setResults([]);

    try {
      const params = new URLSearchParams({
        [searchType]: term,
        limit: "10",
        fields:
          "key,title,author_name,cover_i,isbn,first_publish_year,number_of_pages_median,publisher",
      });

      const [localResult, externalResult] = await Promise.allSettled([
        api.get(`/books/search?q=${encodeURIComponent(term)}`),
        fetch(`https://openlibrary.org/search.json?${params}`),
      ]);

      let localBooks = [];
      let externalBooks = [];

      if (localResult.status === "fulfilled") {
        localBooks = localResult.value.data;
      }

      if (externalResult.status === "fulfilled") {
        const response = externalResult.value;

        if (response.ok) {
          const data = await response.json();

          externalBooks = (data.docs || []).map((book) => ({
            id: book.key,
            title: book.title,
            author: book.author_name?.join(", ") || "Okänd författare",
            cover_url: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : "",
            isbn: book.isbn?.[0] || "",
            release_year: book.first_publish_year || null,
            page_count: book.number_of_pages_median || null,
            publisher: book.publisher?.[0] || "",
            description: "",
            genre: "",
            isExternal: true,
          }));
        }
      }

      if (
        localResult.status === "rejected" &&
        (externalResult.status === "rejected" ||
          !externalResult.value.ok)
      ) {
        throw new Error("Ingen söktjänst svarade.");
      }

      const existing = new Set(
        localBooks.map((book) =>
          `${book.title}|${book.author}`.toLowerCase()
        )
      );

      const uniqueExternal = externalBooks.filter((book) => {
        const key = `${book.title}|${book.author}`.toLowerCase();
        return !existing.has(key);
      });

      setResults([
        ...localBooks.map((book) => ({
          ...book,
          isExternal: false,
        })),
        ...uniqueExternal,
      ]);

      setSearched(true);
    } catch (err) {
      console.error(err);
      setError("Kunde inte söka efter böcker just nu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(book) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      await onSelect(book);
      setQuery("");
      setResults([]);
      setSearched(false);
      setShowManual(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Kunde inte lägga till boken."
      );
    } finally {
      setSaving(false);
    }
  }

  if (showManual) {
    return (
      <div className="bf-search">
        <button
          type="button"
          className="bf-back"
          onClick={() => setShowManual(false)}
        >
          ← Tillbaka till sökningen
        </button>

        {error && <p className="bf-error" role="alert">{error}</p>}

        <AddManualBook
          initialTitle={query}
          onCancel={() => setShowManual(false)}
          onSave={handleAdd}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <section className="bf-search">
      <div className="bf-search-header">
        <div>
          <span className="bf-eyebrow">UTFORSKA BÖCKER</span>
          <h2>Hitta en berättelse.</h2>
          <p>
            Sök efter en bok eller författare, eller lägg till
            en bok som saknas i biblioteket.
          </p>
        </div>

        <div className="bf-search-types" role="group"
          aria-label="Sök efter">
          <button
            type="button"
            className={searchType === "title" ? "active" : ""}
            aria-pressed={searchType === "title"}
            onClick={() => setSearchType("title")}
          >
            Titel
          </button>
          <button
            type="button"
            className={searchType === "author" ? "active" : ""}
            aria-pressed={searchType === "author"}
            onClick={() => setSearchType("author")}
          >
            Författare
          </button>
        </div>
      </div>

      <form className="bf-search-form" onSubmit={handleSearch}>
        <input
          type="search"
          aria-label="Sök efter böcker"
          placeholder={
            searchType === "title"
              ? "Sök efter en boktitel..."
              : "Sök efter en författare..."
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button
          type="submit"
          className="bf-primary"
          disabled={loading || !query.trim()}
        >
          {loading ? "Söker..." : "Sök böcker"}
        </button>
      </form>

      {error && <p className="bf-error" role="alert">{error}</p>}

      {results.length > 0 && (
        <div className="bf-results">
          <div className="bf-results-heading">
            <h3>Sökresultat</h3>
            <span>{results.length} böcker</span>
          </div>

          <div className="bf-results-list">
            {results.map((book, index) => (
              <div
                className="bf-result"
                key={`${book.isExternal ? "external" : "local"}-${book.id ?? index}`}
              >
                <div className="bf-result-cover">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" loading="lazy" />
                  ) : (
                    <div className="bf-cover-fallback">
                      {book.title}
                    </div>
                  )}
                </div>

                <div className="bf-result-info">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <span className="bf-source">
                    {book.isExternal
                      ? "Open Library"
                      : "I biblioteket"}
                  </span>
                </div>

                {book.isExternal ? (
                  <button
                    type="button"
                    className="bf-add-button"
                    disabled={saving}
                    onClick={() => handleAdd(book)}
                  >
                    {saving ? "Sparar..." : "+ Lägg till"}
                  </button>
                ) : (
                  <Link
                    to={`/books/${book.id}`}
                    className="bf-view-button"
                  >
                    Visa bok ↗
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="bf-no-results">
          <h3>Vi hittade ingen matchning.</h3>
          <p>
            Prova en annan sökning eller lägg till boken själv.
          </p>
        </div>
      )}

      <div className="bf-manual-prompt">
        <div>
          <span className="bf-eyebrow">SAKNAS DIN BOK?</span>
          <h3>Lägg till den själv.</h3>
          <p>
            Alla böcker finns inte i våra sökresultat.
            Du kan lägga till en bok manuellt.
          </p>
        </div>

        <button
          type="button"
          className="bf-outline"
          onClick={() => {
            setError("");
            setShowManual(true);
          }}
        >
          Lägg till manuellt ↗
        </button>
      </div>
    </section>
  );
}
