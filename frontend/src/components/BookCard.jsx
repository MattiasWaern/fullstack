
import { Link, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import api from "../api";

export default function BookCard({ book, onDelete }) {
  const navigate = useNavigate();

  function handleEditClick(event) {
    event.preventDefault();
    event.stopPropagation();

    navigate(`/books/${book.id}?edit=true`);
  }

  async function handleDeleteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm(`Vill du ta bort "${book.title}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/books/${book.id}`);

      if (response.status === 200 || response.status === 204) {
        onDelete?.(book.id);
      }
    } catch (error) {
      console.error("Kunde inte ta bort boken:", error);
      alert("Något gick fel när boken skulle tas bort.");
    }
  }

  const genres = (book.genre || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[, ]+/)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Link
      to={`/books/${book.id}`}
      className="bh-library-card"
    >
      <div className="bh-library-cover">
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

      <div className="bh-library-info">
        <h3>{book.title}</h3>

        <p className="bh-library-author">
          {book.author}
        </p>

        <div className="bh-library-rating">
          <StarRating
            rating={Math.round(Number(book.avg_rating) || 0)}
          />

          {book.page_count && (
            <span>{book.page_count} sidor</span>
          )}
        </div>

        {genres.length > 0 && (
          <div className="bh-library-genres">
            {genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        )}

        {book.currently_reading && (
          <span className="bh-library-status">
            <span /> Läser just nu
          </span>
        )}
      </div>

      <div className="bh-library-actions">
        <button
          type="button"
          onClick={handleEditClick}
          aria-label={`Redigera ${book.title}`}
          title="Redigera bok"
        >
          ✎
        </button>

        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label={`Ta bort ${book.title}`}
          title="Ta bort bok"
          className="delete"
        >
          ×
        </button>
      </div>
    </Link>
  );
}
