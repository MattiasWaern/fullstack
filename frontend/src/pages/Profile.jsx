
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import StarRating from "../components/StarRating";
import ReadingTracker from "../components/ReadingTracker";
import "../styles/Profile.css";

export default function Profile() {
  const [reviews, setReviews] = useState([]);
  const [wantToReadBooks, setWantToReadBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("reviews");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(3);
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;

    async function loadProfile() {
      try {
        const [reviewsRes, wantToReadRes] = await Promise.all([
          api.get("/reviews/mine"),
          api.get("/books/my/want-to-read"),
        ]);

        if (!active) return;

        setReviews(reviewsRes.data);
        setWantToReadBooks(wantToReadRes.data);
      } catch (err) {
        if (active) {
          setError("Kunde inte ladda din profilinformation.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [username, navigate]);

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Vill du ta bort recensionen?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Kunde inte ta bort recensionen."
      );
    }
  }

  function startEditingReview(review) {
    setEditingReviewId(review.id);
    setEditReviewText(review.text || "");
    setEditReviewRating(Number(review.rating) || 3);
    setError("");
  }

  function cancelEditingReview() {
    setEditingReviewId(null);
    setEditReviewText("");
    setEditReviewRating(3);
  }

  async function handleUpdateReview(reviewId) {
    if (!editReviewText.trim()) {
      setError("Recensionen kan inte vara tom.");
      return;
    }

    setSavingReview(true);
    setError("");

    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editReviewRating,
        text: editReviewText.trim(),
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                rating: editReviewRating,
                text: editReviewText.trim(),
              }
            : review
        )
      );

      cancelEditingReview();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Kunde inte uppdatera recensionen."
      );
    } finally {
      setSavingReview(false);
    }
  }

  const averageRating = reviews.length
    ? (
        reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="bh-profile-loading" role="status">
        Laddar din läsprofil...
      </div>
    );
  }

  return (
    <div className="bh-profile">
      <header className="bh-profile-header">
        <div className="bh-profile-container">
          <Link to="/" className="bh-profile-back">
            ← Tillbaka till biblioteket
          </Link>

          <div className="bh-profile-intro">
            <div className="bh-profile-identity">
              <div className="bh-profile-avatar">
                {username?.[0]?.toUpperCase() || "?"}
              </div>

              <div>
                <span className="bh-eyebrow">DIN LÄSPROFIL</span>
                <h1>{username}</h1>
                <p>
                  En personlig samling av berättelser,
                  tankar och läsupplevelser.
                </p>
              </div>
            </div>

            <div className="bh-profile-stats">
              <div>
                <strong>{reviews.length}</strong>
                <span>Recensioner</span>
              </div>
              <div>
                <strong>{wantToReadBooks.length}</strong>
                <span>Vill läsa</span>
              </div>
              <div>
                <strong>{averageRating}</strong>
                <span>Snittbetyg</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bh-profile-container bh-profile-main">
        {error && (
          <div className="bh-profile-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Stäng felmeddelande"
            >
              ×
            </button>
          </div>
        )}

        <section className="bh-profile-reading">
          <div className="bh-profile-section-heading">
            <span className="bh-eyebrow">PÅGÅENDE LÄSNING</span>
            <h2>Just nu mellan sidorna</h2>
            <p>Fortsätt där du senast slutade.</p>
          </div>

          <ReadingTracker />
        </section>

        <section className="bh-profile-library">
          <div className="bh-profile-section-heading">
            <span className="bh-eyebrow">DITT PERSONLIGA BIBLIOTEK</span>
            <h2>Böcker & tankar</h2>
            <p>
              Alla dina recensioner och böcker du sparat
              för framtida läsning.
            </p>
          </div>

          <div className="bh-profile-tabs" role="tablist"
            aria-label="Profilinnehåll">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
              className={activeTab === "reviews" ? "active" : ""}
            >
              Mina recensioner
              <span>{reviews.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "wantToRead"}
              onClick={() => setActiveTab("wantToRead")}
              className={activeTab === "wantToRead" ? "active" : ""}
            >
              Vill läsa
              <span>{wantToReadBooks.length}</span>
            </button>
          </div>

          {activeTab === "reviews" && (
            <div role="tabpanel" className="bh-profile-panel">
              {reviews.length === 0 ? (
                <div className="bh-profile-empty">
                  <h3>Din bokdagbok väntar på första sidan.</h3>
                  <p>
                    När du skriver en recension kommer
                    den att visas här.
                  </p>
                  <Link to="/#bibliotek" className="bh-profile-button">
                    Utforska böcker
                  </Link>
                </div>
              ) : (
                <div className="bh-review-list">
                  {reviews.map((review) => {
                    const isEditing =
                      editingReviewId === review.id;

                    return (
                      <article
                        className="bh-review-item"
                        key={review.id}
                      >
                        <Link
                          to={`/books/${review.book_id}`}
                          className="bh-review-cover"
                        >
                          {review.cover_url ? (
                            <img
                              src={review.cover_url}
                              alt={`Omslag till ${review.book_title}`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="bh-cover-placeholder">
                              {review.book_title}
                            </div>
                          )}
                        </Link>

                        <div className="bh-review-content">
                          <span className="bh-eyebrow">
                            MIN BOKRECENSION
                          </span>

                          <Link
                            to={`/books/${review.book_id}`}
                            className="bh-review-title"
                          >
                            {review.book_title}
                          </Link>

                          {isEditing ? (
                            <div className="bh-review-edit">
                              <label>Ditt betyg</label>
                              <StarRating
                                rating={editReviewRating}
                                onRate={setEditReviewRating}
                                size="sm"
                              />

                              <label htmlFor={`review-${review.id}`}>
                                Din recension
                              </label>

                              <textarea
                                id={`review-${review.id}`}
                                rows={5}
                                value={editReviewText}
                                onChange={(event) =>
                                  setEditReviewText(event.target.value)
                                }
                              />

                              <div className="bh-review-actions">
                                <button
                                  type="button"
                                  className="bh-profile-button"
                                  disabled={savingReview}
                                  onClick={() =>
                                    handleUpdateReview(review.id)
                                  }
                                >
                                  {savingReview
                                    ? "Sparar..."
                                    : "Spara ändringar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingReview}
                                >
                                  Avbryt
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="bh-review-rating">
                                <StarRating
                                  rating={review.rating}
                                  size="sm"
                                />
                                <span>{review.rating}/5</span>
                              </div>

                              <p className="bh-review-text">
                                {review.text}
                              </p>

                              <div className="bh-review-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditingReview(review)
                                  }
                                >
                                  Redigera recension
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() =>
                                    handleDeleteReview(review.id)
                                  }
                                >
                                  Ta bort
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "wantToRead" && (
            <div role="tabpanel" className="bh-profile-panel">
              {wantToReadBooks.length === 0 ? (
                <div className="bh-profile-empty">
                  <h3>Här finns plats för fler berättelser.</h3>
                  <p>
                    Lägg till böcker du vill läsa så
                    samlas de här.
                  </p>
                  <Link to="/#bibliotek" className="bh-profile-button">
                    Hitta böcker
                  </Link>
                </div>
              ) : (
                <div className="bh-profile-book-grid">
                  {wantToReadBooks.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="bh-profile-book"
                    >
                      <div className="bh-profile-book-cover">
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

                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                      <span>Visa bok ↗</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
