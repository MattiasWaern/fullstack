
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ReadingTracker() {
  const [readingList, setReadingList] = useState([]);
  const [updatePages, setUpdatePages] = useState({});
  const [updating, setUpdating] = useState({});
  const [messages, setMessages] = useState({});

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;

    api.get("/books/my/reading-progress")
      .then(({ data }) => {
        if (active) setReadingList(data);
      })
      .catch((error) => {
        console.error("Kunde inte hämta lässtatus:", error);
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  async function handlePageUpdate(bookId, totalPages) {
    const value = updatePages[bookId];

    if (value === undefined || value === "") {
      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "error",
          text: "Ange ett sidnummer.",
        },
      }));
      return;
    }

    const newPage = Number(value);

    if (
      !Number.isInteger(newPage) ||
      newPage < 0 ||
      (totalPages !== null && newPage > totalPages)
    ) {
      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "error",
          text:
            totalPages !== null
              ? `Ange en sida mellan 0 och ${totalPages}.`
              : "Ange ett giltigt sidnummer.",
        },
      }));
      return;
    }

    setUpdating((prev) => ({
      ...prev,
      [bookId]: true,
    }));

    setMessages((prev) => ({
      ...prev,
      [bookId]: null,
    }));

    try {
      await api.post(`/books/${bookId}/progress`, {
        current_page: newPage,
      });

      setReadingList((prev) =>
        prev.map((item) =>
          item.book_id === bookId
            ? { ...item, current_page: newPage }
            : item
        )
      );

      setUpdatePages((prev) => ({
        ...prev,
        [bookId]: "",
      }));

      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "success",
          text: "Läsframsteg uppdaterat!",
        },
      }));
    } catch (error) {
      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "error",
          text:
            error.response?.data?.error ||
            "Kunde inte uppdatera lässtatus.",
        },
      }));
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [bookId]: false,
      }));
    }
  }

  if (!isLoggedIn || readingList.length === 0) {
    return null;
  }

  return (
    <section className="bh-reading-list">
      {readingList.map((book) => {
        const totalPages = Number(book.page_count);
        const currentPage = Number(book.current_page) || 0;

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

        const message = messages[book.book_id];

        return (
          <article
            className="bh-reading-card"
            key={book.book_id}
          >
            <Link
              to={`/books/${book.book_id}`}
              className="bh-reading-cover"
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Omslag till ${book.title}`}
                />
              ) : (
                <div className="bh-cover-placeholder">
                  {book.title}
                </div>
              )}
            </Link>

            <div className="bh-reading-content">
              <div className="bh-reading-top">
                <div>
                  <span className="bh-reading-label">
                    LÄSER JUST NU
                  </span>

                  <Link
                    to={`/books/${book.book_id}`}
                    className="bh-reading-title"
                  >
                    {book.title}
                  </Link>

                  <p className="bh-reading-author">
                    {book.author}
                  </p>
                </div>

                {percentage !== null && (
                  <span className="bh-reading-percentage">
                    {percentage}%
                  </span>
                )}
              </div>

              <div className="bh-progress-details">
                <span>
                  Sida {currentPage}
                  {hasPageCount ? ` av ${totalPages}` : ""}
                </span>

                <span>
                  {percentage === 100
                    ? "Färdigläst"
                    : "Din läsresa"}
                </span>
              </div>

              <div
                className="bh-progress-track"
                role={percentage !== null ? "progressbar" : undefined}
                aria-label={`Läsframsteg för ${book.title}`}
                aria-valuenow={percentage ?? undefined}
                aria-valuemin={percentage !== null ? 0 : undefined}
                aria-valuemax={percentage !== null ? 100 : undefined}
              >
                <div
                  className="bh-progress-fill"
                  style={{ width: `${percentage ?? 0}%` }}
                />
              </div>

              <form
                className="bh-reading-form"
                onSubmit={(event) => {
                  event.preventDefault();

                  handlePageUpdate(
                    book.book_id,
                    hasPageCount ? totalPages : null
                  );
                }}
              >
                <label htmlFor={`page-${book.book_id}`}>
                  Uppdatera sidnummer
                </label>

                <div className="bh-reading-actions">
                  <input
                    id={`page-${book.book_id}`}
                    type="number"
                    min="0"
                    max={hasPageCount ? totalPages : undefined}
                    step="1"
                    placeholder="Sidnummer"
                    value={updatePages[book.book_id] ?? ""}
                    onChange={(event) => {
                      setUpdatePages((prev) => ({
                        ...prev,
                        [book.book_id]: event.target.value,
                      }));

                      setMessages((prev) => ({
                        ...prev,
                        [book.book_id]: null,
                      }));
                    }}
                  />

                  <button
                    type="submit"
                    disabled={updating[book.book_id]}
                  >
                    {updating[book.book_id]
                      ? "Sparar..."
                      : "Uppdatera"}
                  </button>
                </div>
              </form>

              {message && (
                <p
                  className={`bh-reading-message ${message.type}`}
                  role="status"
                >
                  {message.text}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
