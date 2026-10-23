import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import BookCard from '../components/BookCard';
import BookSearch from '../components/BookSearch';
import WantToReadSidebar from '../components/WantToReadSidebar';
import ReadingTracker from "../components/ReadingTracker";

// Variant B: bokryggar. Alla böcker står som färgade ryggar på en hylla.
// Typsnitt: Bricolage Grotesque, lägg till i index.html:
// <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" rel="stylesheet">
const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const SPINES = [
  { bg: '#D1495B', fg: '#FFFFFF' },
  { bg: '#EDAE49', fg: '#1B1B1F' },
  { bg: '#00798C', fg: '#FFFFFF' },
  { bg: '#30638E', fg: '#FFFFFF' },
  { bg: '#66A182', fg: '#10231A' },
  { bg: '#1B1B1F', fg: '#FFFFFF' },
];

const splitGenres = (genre) => (genre || '').split(/[, ]+/).filter(Boolean);

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('');
  const [genre, setGenre] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    api.get('/books').then(r => setBooks(r.data));
  }, []);

  async function addBook(bookData) {
    const { data } = await api.post('/books', bookData);
    setBooks(prev => [{ ...data, review_count: 0 }, ...prev]);
    setShowAdd(false);
  }

  const handleDeleteFromList = (bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const filtered = books.filter(b =>
    (b.title.toLowerCase().includes(filter.toLowerCase()) ||
      b.author.toLowerCase().includes(filter.toLowerCase())) &&
    (!genre || splitGenres(b.genre).includes(genre))
  );

  const totalReviews = books.reduce((sum, b) => sum + (b.review_count || 0), 0);
  const genres = [...new Set(books.flatMap(b => splitGenres(b.genre)))].slice(0, 10);

  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]";

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#1B1B1F] ${FONT}`}>

      {/* HERO */}
      <header className="border-b border-[#E4E4E7]">
        <div className="max-w-7xl mx-auto px-4 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-4">
                Hela biblioteket, på en hylla
              </h1>
              <p className="text-lg text-[#52525B] leading-relaxed">
                Klicka på en rygg för att läsa recensionerna. {books.length} böcker och {totalReviews} recensioner hittills.
              </p>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => setShowAdd(!showAdd)}
                aria-expanded={showAdd}
                className={`bg-[#1B1B1F] hover:bg-[#3A3A42] text-white px-7 py-3 rounded-full font-semibold transition-colors ${focusRing}`}
              >
                {showAdd ? 'Stäng' : 'Lägg till en bok'}
              </button>
            ) : (
              <Link
                to="/register"
                className={`bg-[#1B1B1F] hover:bg-[#3A3A42] text-white px-7 py-3 rounded-full font-semibold transition-colors ${focusRing}`}
              >
                Skapa konto gratis
              </Link>
            )}
          </div>

          {/* RYGGARNA */}
          <nav aria-label="Böcker som bokryggar">
            {filtered.length > 0 ? (
              <ul className="flex items-end gap-1.5 overflow-x-auto pt-4 pb-0 [scrollbar-width:thin]">
                {filtered.slice(0, 40).map((book, i) => {
                  const c = SPINES[(book.id ?? i) % SPINES.length] || SPINES[0];
                  const len = book.title.length;
                  const height = 150 + (len % 5) * 14;
                  const width = 38 + (len % 3) * 8;
                  return (
                    <li key={book.id} className="flex-shrink-0">
                      <Link
                        to={`/books/${book.id}`}
                        title={`${book.title} av ${book.author}`}
                        aria-label={`${book.title} av ${book.author}`}
                        style={{ background: c.bg, color: c.fg, height, width, writingMode: 'vertical-rl' }}
                        className={`flex items-start rounded-t-sm px-2 py-3 text-sm font-semibold transition-transform duration-150 hover:-translate-y-2 ${focusRing}`}
                      >
                        <span className="block max-h-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {book.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-16 text-[#52525B]">Inga böcker att ställa på hyllan än.</p>
            )}
            <div className="h-3 bg-[#1B1B1F]" />
          </nav>
        </div>
      </header>

      {showAdd && (
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E4E4E7]">
            <h2 className="font-bold text-xl mb-4">Sök och lägg till böcker</h2>
            <BookSearch onSelect={addBook} />
          </div>
        </div>
      )}

      {/* HUVUDYTA, sidokolumnen ligger till höger i den här varianten */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10 items-start">

        <main className="flex-1 min-w-0 w-full order-2 lg:order-1">
          <ReadingTracker />

          <div className="flex flex-wrap items-end justify-between gap-4 mb-4 mt-8">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Alla böcker
              <span className="text-[#71717A] text-lg font-normal ml-2">{filtered.length}</span>
            </h2>
            <div>
              <label htmlFor="book-filter" className="sr-only">Filtrera böcker på titel eller författare</label>
              <input
                id="book-filter"
                placeholder="Sök titel eller författare"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="border border-[#D4D4D8] rounded-full px-5 py-2 text-sm bg-white w-60 md:w-72 focus:outline-none focus:ring-2 focus:ring-[#30638E]"
              />
            </div>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrera på genre">
              {['', ...genres].map(g => (
                <button
                  key={g || 'alla'}
                  onClick={() => setGenre(g === genre ? '' : g)}
                  aria-pressed={genre === g}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${focusRing} ${
                    genre === g
                      ? 'bg-[#1B1B1F] text-white border-[#1B1B1F]'
                      : 'bg-white border-[#D4D4D8] hover:border-[#1B1B1F]'
                  }`}
                >
                  {g || 'Alla'}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-16">
              <p className="text-xl font-semibold">Inga böcker matchar</p>
              <p className="text-[#71717A] mt-1">Ändra sökningen eller välj en annan genre.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} onDelete={handleDeleteFromList} />
            ))}
          </div>
        </main>

        <aside className="flex-shrink-0 w-full lg:w-auto order-1 lg:order-2">
          <WantToReadSidebar />
        </aside>
      </div>

      <footer className="border-t border-[#E4E4E7] mt-12 py-6 text-center text-sm text-[#71717A]">
        © 2026 MyReads. Byggd för böcker.
      </footer>
    </div>
  );
}