
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function WantToReadSidebar() {
  const [books, setBooks] = useState([]);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;

    api.get("/books/my/want-to-read")
      .then(({ data }) => {
        if (active) setBooks(data);
      })
      .catch((error) => {
        console.error("Kunde inte hämta läslistan:", error);
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn || books.length === 0) {
    return null;
  }

  return (
    <aside className="bh-wishlist">
      <div className="bh-wishlist-header">
        <div>
          <span className="bh-eyebrow">
            DIN BOKHYLLA
          </span>

          <h3>Vill läsa</h3>
        </div>

        <span className="bh-wishlist-count">
          {books.length}
        </span>
      </div>

      <div className="bh-wishlist-books">
        {books.slice(0, 5).map((book) => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="bh-wishlist-book"
          >
            <div className="bh-wishlist-cover">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Omslag till ${book.title}`}
                  loading="lazy"
                />
              ) : (
                <div className="bh-cover-placeholder">
                  {book.title}
                </div>
              )}
            </div>

            <div className="bh-wishlist-info">
              <h4>{book.title}</h4>
              <p>{book.author}</p>
              <span>Visa bok ↗</span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/books/my/want-to-read"
        className="bh-wishlist-footer"
      >
        Visa hela läslistan <span>↗</span>
      </Link>
    </aside>
  );
}
