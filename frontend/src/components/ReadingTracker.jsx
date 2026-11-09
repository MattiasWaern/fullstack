
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/ReadingTracker.css";

export default function ReadingTracker() {
  const [readingList, setReadingList] = useState([]);
  const [draftPages, setDraftPages] = useState({});
  const [updating, setUpdating] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadReadingList() {
      try {
        const { data } = await api.get(
          "/books/my/reading-progress"
        );

        if (active) {
          setReadingList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Kunde inte hämta lässtatus:", error);

        if (active) {
          setLoadError("Kunde inte hämta dina läsframsteg.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReadingList();

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  function getBookProgress(book) {
    const currentPage = Number(book.current_page) || 0;
    const totalPages = Number(book.page_count);
    const hasPageCount =
      Number.isFinite(totalPages) && totalPages > 0;

    const percentage = hasPageCount
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((currentPage / totalPages) * 100)
          )
        )
      : null;

    return {
      currentPage,
      totalPages,
      hasPageCount,
      percentage,
      remainingPages: hasPageCount
        ? Math.max(0, totalPages - currentPage)
        : null,
    };
  }

  function setMessage(bookId, type, text) {
    setMessages((prev) => ({
      ...prev,
      [bookId]: { type, text },
    }));
  }

  async function saveProgress(book, page) {
    const {
      totalPages,
      hasPageCount,
    } = getBookProgress(book);

    const bookId = book.book_id;
    const newPage = Number(page);

    if (
      !Number.isSafeInteger(newPage) ||
      newPage < 0 ||
      (hasPageCount && newPage > totalPages)
    ) {
      setMessage(
        bookId,
        "error",
        hasPageCount
          ? `Ange en sida mellan 0 och ${totalPages}.`
          : "Ange ett giltigt sidnummer."
      );
      return;
    }

    if (updating[bookId]) return;

    setUpdating((prev) => ({
      ...prev,
      [bookId]: true,
    }));

    setMessages((prev) => ({
      ...prev,
      [bookId]: null,
    }));

    try {
      const { data } = await api.post(
        `/books/${bookId}/progress`,
        { current_page: newPage }
      );

      const savedPage = Number(data.current_page);

      setReadingList((prev) =>
        prev.map((item) =>
          String(item.book_id) === String(bookId)
            ? {
                ...item,
                current_page: Number.isFinite(savedPage)
                  ? savedPage
                  : newPage,
              }
            : item
        )
      );

      setDraftPages((prev) => ({
        ...prev,
        [bookId]: "",
      }));

      setMessage(
        bookId,
        "success",
        hasPageCount && newPage === totalPages
          ? "Du har nått sista sidan!"
          : "Läsframstegen har sparats."
      );
    } catch (error) {
      setMessage(
        bookId,
        "error",
        error.response?.data?.error ||
          "Kunde inte spara dina läsframsteg."
      );
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [bookId]: false,
      }));
    }
  }

  async function removeProgress(book) {
    const bookId = book.book_id;
    if (updating[bookId]) return;

    const confirmed = window.confirm(
      `Vill du ta bort "${book.title}" från Reading Tracker? Dina sparade läsframsteg tas bort.`
    );
    if (!confirmed) return;

    setUpdating((prev) => ({ ...prev, [bookId]: true }));
    setMessages((prev) => ({ ...prev, [bookId]: null }));

    try {
      await api.delete(`/books/${bookId}/progress`);
      setReadingList((prev) =>
        prev.filter((item) => String(item.book_id) !== String(bookId))
      );
      setDraftPages((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
    } catch (error) {
      setMessage(
        bookId,
        "error",
        error.response?.data?.error || "Kunde inte ta bort boken från Reading Tracker."
      );
    } finally {
      setUpdating((prev) => ({ ...prev, [bookId]: false }));
    }
  }

  function addPages(book, amount) {
    const {
      currentPage,
      totalPages,
      hasPageCount,
    } = getBookProgress(book);

    const nextPage = hasPageCount
      ? Math.min(totalPages, currentPage + amount)
      : currentPage + amount;

    if (nextPage === currentPage) return;

    saveProgress(book, nextPage);
  }

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="rt-feedback" role="status">
        Hämtar dina läsframsteg...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rt-feedback rt-feedback-error" role="alert">
        {loadError}
      </div>
    );
  }

  if (readingList.length === 0) {
    return (
      <div className="rt-empty">
        <span className="rt-eyebrow">DIN LÄSRESA</span>
        <h3>Vilken bok blir din nästa?</h3>
        <p>
          När du börjar läsa en bok kommer dina
          framsteg att visas här.
        </p>
        <Link to="/#bibliotek">
          Utforska biblioteket <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rt-list">
      {readingList.map((book) => {
        const {
          currentPage,
          totalPages,
          hasPageCount,
          percentage,
          remainingPages,
        } = getBookProgress(book);

        const bookId = book.book_id;
        const isUpdating = Boolean(updating[bookId]);
        const message = messages[bookId];
        const isComplete =
          hasPageCount && currentPage >= totalPages;

        return (
          <article className="rt-card" key={bookId}>
            <Link
              to={`/books/${bookId}`}
              className="rt-cover"
              aria-label={`Visa ${book.title}`}
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Omslag till ${book.title}`}
                  loading="lazy"
                />
              ) : (
                <div className="rt-cover-placeholder">
                  {book.title}
                </div>
              )}
            </Link>

            <div className="rt-content">
              <div className="rt-top">
                <div className="rt-book-info">
                  <span className="rt-eyebrow">
                    {isComplete
                      ? "SISTA SIDAN NÅDD"
                      : "LÄSER JUST NU"}
                  </span>

                  <Link
                    to={`/books/${bookId}`}
                    className="rt-title"
                  >
                    {book.title}
                  </Link>

                  <p className="rt-author">
                    {book.author}
                  </p>
                </div>

                <div className="rt-percentage">
                  {percentage !== null ? (
                    <>
                      <strong>{percentage}%</strong>
                      <span>klart</span>
                    </>
                  ) : (
                    <span>Pågående</span>
                  )}
                </div>
              </div>

              <div className="rt-progress-info">
                <span>
                  Sida <strong>{currentPage}</strong>
                  {hasPageCount && ` av ${totalPages}`}
                </span>

                <span>
                  {isComplete
                    ? "Sista sidan nådd"
                    : remainingPages !== null
                      ? `${remainingPages} sidor kvar`
                      : "Sidantal saknas"}
                </span>
              </div>

              <div
                className="rt-progress-track"
                role={hasPageCount ? "progressbar" : undefined}
                aria-label={`Läsframsteg för ${book.title}`}
                aria-valuenow={percentage ?? undefined}
                aria-valuemin={hasPageCount ? 0 : undefined}
                aria-valuemax={hasPageCount ? 100 : undefined}
              >
                <div
                  className="rt-progress-fill"
                  style={{ width: `${percentage ?? 0}%` }}
                />
              </div>

              <div className="rt-controls">
                <form
                  className="rt-page-form"
                  onSubmit={(event) => {
                    event.preventDefault();

                    const value = draftPages[bookId];

                    if (value === "" || value === undefined) {
                      setMessage(
                        bookId,
                        "error",
                        "Ange ett sidnummer."
                      );
                      return;
                    }

                    saveProgress(book, value);
                  }}
                >
                  <label htmlFor={`rt-page-${bookId}`}>
                    Uppdatera sida
                  </label>

                  <div className="rt-page-input-row">
                    <input
                      id={`rt-page-${bookId}`}
                      type="number"
                      min="0"
                      max={hasPageCount ? totalPages : undefined}
                      step="1"
                      placeholder="Sidnummer"
                      value={draftPages[bookId] ?? ""}
                      disabled={isUpdating}
                      onChange={(event) => {
                        setDraftPages((prev) => ({
                          ...prev,
                          [bookId]: event.target.value,
                        }));

                        setMessages((prev) => ({
                          ...prev,
                          [bookId]: null,
                        }));
                      }}
                    />

                    <button
                      type="submit"
                      className="rt-save-button"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Sparar..." : "Spara"}
                    </button>
                  </div>
                </form>

                <div className="rt-quick-actions">
                  <span>Snabbuppdatering</span>

                  <div className="rt-quick-buttons">
                    {[1, 10, 25].map((amount) => (
                      <button
                        type="button"
                        key={amount}
                        disabled={isUpdating || isComplete}
                        onClick={() => addPages(book, amount)}
                        aria-label={`Lägg till ${amount} sidor för ${book.title}`}
                      >
                        +{amount}
                      </button>
                    ))}

                    {hasPageCount && (
                      <button
                        type="button"
                        className="rt-finish-button"
                        disabled={isUpdating || isComplete}
                        onClick={() =>
                          saveProgress(book, totalPages)
                        }
                      >
                        {isComplete ? "Klart ✓" : "Sista sidan ✓"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
                <button
                  type="button"
                  className="rt-remove-button"
                  disabled={isUpdating}
                  onClick={() => removeProgress(book)}
                  aria-label={`Ta bort ${book.title} från Reading Tracker`}
                >
                  {isUpdating ? "Vänta..." : "Ta bort från Reading Tracker"}
                </button>
              {message && (
                <p
                  className={`rt-message rt-${message.type}`}
                  role="status"
                >
                  {message.text}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
