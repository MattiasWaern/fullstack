
import { useState } from "react";
import api from "../api";
import AddManualBook from "./AddManualBook";

const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const SPINES = [
  "#D1495B",
  "#EDAE49",
  "#00798C",
  "#30638E",
  "#66A182",
  "#1B1B1F",
];

export default function BookSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("title");
  const [showManualForm, setShowManualForm] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function search() {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    setHasSearched(false);
    setResults([]);

    try {
      const localRes = await api.get(
        `/books/search?q=${encodeURIComponent(query.trim())}`
      );

      const field = searchType === "author" ? "author" : "title";

      const olRes = await fetch(
        `https://openlibrary.org/search.json?${field}=${encodeURIComponent(
          query.trim()
        )}&limit=6`
      );

      if (!olRes.ok) {
        throw new Error("Kunde inte hämta böcker från Open Library");
      }

      const olData = await olRes.json();

      const olBooks = (olData.docs || []).map((book) => ({
        id: book.key,
        title: book.title,
        author: book.author_name?.join(", ") || "Okänd",
        cover_url: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        isbn: book.isbn?.[0] || "",
        isExternal: true,
      }));

      const localBooks = localRes.data;

      const localTitles = new Set(
        localBooks.map((book) => book.title.toLowerCase())
      );

      const uniqueOlBooks = olBooks.filter(
        (book) => !localTitles.has(book.title.toLowerCase())
      );

      setResults([...localBooks, ...uniqueOlBooks]);
      setHasSearched(true);
    } catch (err) {
      console.error("Sökningen misslyckades:", err);
      setError("Något gick fel vid sökningen. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(book) {
    onSelect(book);
    setResults([]);
    setQuery("");
    setHasSearched(false);
  }

  if (showManualForm) {
    return (
      <div className={FONT}>
        <div className="mb-6">
          <button
            onClick={() => setShowManualForm(false)}
            className="mb-4 text-sm font-semibold text-[#52525B] transition-colors hover:text-[#1B1B1F]"
          >
            ← Tillbaka till sökningen
          </button>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#1B1B1F]">
            Lägg till en bok
          </h2>

          <p className="mt-1 text-sm text-[#71717A]">
            Fyll i informationen om boken manuellt.
          </p>
        </div>

        <AddManualBook
          initialTitle={query}
          onCancel={() => setShowManualForm(false)}
          onSave={(data) => {
            onSelect(data);
            setShowManualForm(false);
            setQuery("");
            setResults([]);
            setHasSearched(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full ${FONT}`}>

      {/* SÖKTYP */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-[#1B1B1F]">
            Hitta din nästa bok
          </h3>

          <p className="mt-1 text-sm text-[#71717A]">
            Sök bland böcker från biblioteket och Open Library.
          </p>
        </div>

        <div
          className="flex rounded-full border border-[#E4E4E7] bg-[#F4F4F5] p-1"
          role="group"
          aria-label="Välj söktyp"
        >
          {[
            { value: "title", label: "Titel" },
            { value: "author", label: "Författare" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value)}
              aria-pressed={searchType === type.value}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                searchType === type.value
                  ? "bg-[#1B1B1F] text-white shadow-sm"
                  : "text-[#71717A] hover:text-[#1B1B1F]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* SÖKFÄLT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="search"
            aria-label={
              searchType === "title"
                ? "Sök efter boktitel"
                : "Sök efter författare"
            }
            placeholder={
              searchType === "title"
                ? "Sök efter en boktitel..."
                : "Sök efter en författare..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-[#D4D4D8] bg-white py-3.5 pl-12 pr-5 text-sm text-[#1B1B1F] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#30638E] focus:ring-2 focus:ring-[#30638E]/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center justify-center gap-2 rounded-full bg-[#1B1B1F] px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#3A3A42] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {loading ? "Söker..." : "Sök böcker"}
        </button>
      </form>

      {/* FELMEDDELANDE */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {/* RESULTAT */}
      {results.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">

          <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#FAFAFA] px-5 py-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#1B1B1F]">
                Sökresultat
              </h4>
              <p className="mt-0.5 text-xs text-[#71717A]">
                Välj en bok för att lägga till den.
              </p>
            </div>

            <span className="rounded-full bg-[#1B1B1F] px-3 py-1 text-xs font-bold text-white">
              {results.length}
            </span>
          </div>

          <div className="max-h-[420px] divide-y divide-[#F0F0F2] overflow-y-auto">
            {results.map((item, index) => (
              <button
                key={`${item.isExternal ? "external" : "local"}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[#FAFAFA]"
              >
                {/* OMSLAG */}
                <div className="relative w-14 shrink-0">
                  <div
                    className="absolute bottom-0 left-0 top-0 z-10 w-1 rounded-l-sm"
                    style={{
                      backgroundColor:
                        SPINES[index % SPINES.length],
                    }}
                  />

                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt=""
                      className="aspect-[2/3] w-full rounded-md object-cover shadow-sm transition-transform duration-200 group-hover:-translate-y-1"
                    />
                  ) : (
                    <div
                      className="flex aspect-[2/3] items-center justify-center rounded-md p-1 text-center text-[10px] font-bold text-white"
                      style={{
                        backgroundColor:
                          SPINES[index % SPINES.length],
                      }}
                    >
                      {item.title}
                    </div>
                  )}
                </div>

                {/* BOKINFORMATION */}
                <div className="min-w-0 flex-1">
                  <h5 className="line-clamp-2 text-sm font-bold text-[#1B1B1F] transition-colors group-hover:text-[#30638E]">
                    {item.title}
                  </h5>

                  <p className="mt-1 text-xs text-[#71717A]">
                    av {item.author}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      item.isExternal
                        ? "bg-[#E6F3F4] text-[#00798C]"
                        : "bg-[#F4F4F5] text-[#52525B]"
                    }`}
                  >
                    {item.isExternal
                      ? "Open Library"
                      : "Finns i biblioteket"}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4E4E7] text-xl text-[#71717A] transition-all group-hover:border-[#1B1B1F] group-hover:bg-[#1B1B1F] group-hover:text-white"
                >
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INGA RESULTAT */}
      {hasSearched && results.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-6 py-10 text-center">
          <div className="mb-3 text-3xl">📚</div>

          <h4 className="text-lg font-extrabold text-[#1B1B1F]">
            Inga böcker hittades
          </h4>

          <p className="mt-2 text-sm text-[#71717A]">
            Prova en annan sökning eller lägg till boken manuellt.
          </p>
        </div>
      )}

      {/* LÄGG TILL MANUELLT */}
      <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-5 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-sm font-bold text-[#1B1B1F]">
            Hittar du inte din bok?
          </h4>

          <p className="mt-1 text-xs text-[#71717A]">
            Du kan alltid lägga till en bok själv.
          </p>
        </div>

        <button
          onClick={() => setShowManualForm(true)}
          className="shrink-0 rounded-full border border-[#D4D4D8] bg-white px-5 py-2.5 text-xs font-bold text-[#1B1B1F] transition-all hover:border-[#1B1B1F] hover:bg-[#1B1B1F] hover:text-white"
        >
          + Lägg till manuellt
        </button>
      </div>
    </div>
  );
}
