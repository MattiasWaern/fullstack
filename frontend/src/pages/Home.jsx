
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import BookCard from "../components/BookCard";
import BookSearch from "../components/BookSearch";
import WantToReadSidebar from "../components/WantToReadSideBar";
import ReadingTracker from "../components/ReadingTracker";

const genresFrom = (value) =>
  (value || "").split(/[, ]+/).filter(Boolean);

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("");
  const [genre, setGenre] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const loggedIn = Boolean(localStorage.getItem("token"));
  const username = localStorage.getItem("username");

  useEffect(() => {
    let active = true;

    api.get("/books")
      .then(({ data }) => {
        if (active) setBooks(data);
      })
      .catch(() => {
        if (active) {
          setError("Kunde inte hämta böckerna. Försök igen senare.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function addBook(bookData) {
    const { data } = await api.post("/books", bookData);

    setBooks((prev) => [
      { ...data, review_count: 0 },
      ...prev,
    ]);

    setShowAdd(false);
  }

  const filtered = books.filter(
    (book) =>
      `${book.title || ""} ${book.author || ""}`
        .toLowerCase()
        .includes(filter.toLowerCase()) &&
      (!genre || genresFrom(book.genre).includes(genre))
  );

  const genres = [
    ...new Set(books.flatMap((book) => genresFrom(book.genre))),
  ].slice(0, 8);

  const reviews = books.reduce(
    (total, book) => total + Number(book.review_count || 0),
    0
  );

  const featured = books
    .filter((book) => book.cover_url)
    .slice(0, 5);

  return (
    <div className="bh-page">
      <div className="bh-layout">
        <aside className="bh-sidebar" aria-label="Snabblänkar">
          <div className="bh-side-heading">DITT BIBLIOTEK</div>

          <Link className="bh-side-link bh-active" to="/">
            ⌂ <span>Översikt</span>
          </Link>

          <Link className="bh-side-link" to="/profile">
            ▤ <span>Min profil</span>
          </Link>

          <a className="bh-side-link" href="#bibliotek">
            ⌕ <span>Utforska böcker</span>
          </a>

          <div className="bh-side-divider" />

          <div className="bh-side-heading">DIN LÄSNING</div>

          <a className="bh-side-link" href="#laser-nu">
            ◷ <span>Läser just nu</span>
          </a>

          <a className="bh-side-link" href="#laslista">
            ♡ <span>Vill läsa</span>
          </a>

          <div className="bh-side-note">
            <span>ETT KAPITEL I TAGET</span>
            <p>Varje bok är början på en ny berättelse.</p>
            <div className="bh-side-ornament">✳</div>
          </div>
        </aside>

        <div className="bh-content">
          <header className="bh-hero">
            <div className="bh-hero-copy">
              <span className="bh-eyebrow">
                VÄLKOMMEN TILL MYREADS
              </span>

              <h1>
                {username ? (
                  <>
                    Fortsätt din <em>läsresa,</em>
                    <br />
                    {username}.
                  </>
                ) : (
                  <>
                    Din nästa stora
                    <br />
                    <em>läsupplevelse</em> börjar här.
                  </>
                )}
              </h1>

              <p>
                Samla dina böcker, följ dina läsäventyr och
                upptäck berättelser värda att minnas.
              </p>

              <a href="#bibliotek" className="bh-hero-link">
                Utforska biblioteket <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="bh-hero-art" aria-hidden="true">
              <span className="bh-art-circle" />
              <span className="bh-art-book one" />
              <span className="bh-art-book two" />
              <span className="bh-art-book three" />
              <span className="bh-art-spark">✦</span>
            </div>
          </header>

          <div className="bh-inner">
            <div className="bh-main-grid">
              <main className="bh-primary">
                <section id="laser-nu" className="bh-section">
                  <div className="bh-section-heading">
                    <div>
                      <span className="bh-eyebrow">DIN LÄSNING</span>
                      <h2>På nattduksbordet</h2>
                    </div>

                    <Link to="/profile" className="bh-text-link">
                      Min profil ↗
                    </Link>
                  </div>

                  {loggedIn ? (
                    <div className="bh-tracker">
                      <ReadingTracker />
                    </div>
                  ) : (
                    <div className="bh-empty">
                      <p>
                        Håll koll på vilka böcker du läser och
                        hur långt du kommit.
                      </p>

                      <Link to="/login" className="bh-button">
                        Logga in för att börja
                      </Link>
                    </div>
                  )}
                </section>

                {featured.length > 0 && (
                  <section className="bh-section">
                    <div className="bh-section-heading">
                      <div>
                        <span className="bh-eyebrow">
                          FRÅN BIBLIOTEKET
                        </span>
                        <h2>Berättelser att upptäcka</h2>
                      </div>

                      <a href="#bibliotek" className="bh-text-link">
                        Visa alla ↗
                      </a>
                    </div>

                    <div className="bh-featured">
                      {featured.map((book) => (
                        <Link
                          className="bh-featured-book"
                          to={`/books/${book.id}`}
                          key={book.id}
                        >
                          <img
                            src={book.cover_url}
                            alt={`Omslag: ${book.title}`}
                            loading="lazy"
                          />

                          <strong>{book.title}</strong>
                          <span>{book.author}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <section
                  id="bibliotek"
                  className="bh-section bh-library"
                >
                  <div className="bh-section-heading">
                    <div>
                      <span className="bh-eyebrow">
                        BLÄDDRA & HITTA
                      </span>

                      <h2>
                        Hela biblioteket{" "}
                        <span className="bh-count">
                          {filtered.length}
                        </span>
                      </h2>
                    </div>

                    {loggedIn ? (
                      <button
                        className="bh-button"
                        onClick={() => setShowAdd((v) => !v)}
                        aria-expanded={showAdd}
                      >
                        {showAdd ? "Stäng" : "+ Lägg till bok"}
                      </button>
                    ) : (
                      <Link className="bh-button" to="/login">
                        Logga in
                      </Link>
                    )}
                  </div>

                  {showAdd && (
                    <div className="bh-add">
                      <BookSearch onSelect={addBook} />
                    </div>
                  )}

                  <label
                    className="bh-search-label"
                    htmlFor="bh-filter"
                  >
                    Sök bland böckerna
                  </label>

                  <div className="bh-search">
                    <span aria-hidden="true">⌕</span>

                    <input
                      id="bh-filter"
                      placeholder="Sök titel eller författare…"
                      value={filter}
                      onChange={(event) =>
                        setFilter(event.target.value)
                      }
                    />
                  </div>

                  {genres.length > 0 && (
                    <div
                      className="bh-genres"
                      aria-label="Filtrera på genre"
                    >
                      {["", ...genres].map((g) => (
                        <button
                          key={g || "alla"}
                          aria-pressed={genre === g}
                          className={
                            genre === g ? "selected" : ""
                          }
                          onClick={() =>
                            setGenre(g === genre ? "" : g)
                          }
                        >
                          {g || "Alla böcker"}
                        </button>
                      ))}
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="bh-error">
                      {error}
                    </p>
                  )}

                  {!error && filtered.length === 0 && (
                    <p className="bh-empty">
                      Inga böcker matchar din sökning.
                    </p>
                  )}

                  <div className="bh-book-grid">
                    {filtered.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onDelete={(id) =>
                          setBooks((prev) =>
                            prev.filter((item) => item.id !== id)
                          )
                        }
                      />
                    ))}
                  </div>
                </section>
              </main>

              <aside className="bh-right">
                <div className="bh-stat">
                  <span className="bh-eyebrow">
                    BIBLIOTEKET I SIFFROR
                  </span>

                  <div className="bh-stat-grid">
                    <div>
                      <strong>{books.length}</strong>
                      <span>Böcker</span>
                    </div>

                    <div>
                      <strong>{reviews}</strong>
                      <span>Recensioner</span>
                    </div>
                  </div>

                  <p>En växande samling berättelser.</p>
                </div>

                <div id="laslista" className="bh-want">
                  <WantToReadSidebar />
                </div>

                <div className="bh-quote">
                  <span>✳</span>
                  <p>
                    “A reader lives a thousand lives before he dies.”
                  </p>
                  <small>— George R. R. Martin</small>
                </div>
              </aside>
            </div>
          </div>

          <footer className="bh-footer">
            © 2026 MyReads
            <span>Skapad för dig som älskar böcker.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
