
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import StarRating from "../components/StarRating";
import ReadingTracker from "../components/ReadingTracker";

const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const SPINES = [
  "#D1495B",
  "#EDAE49",
  "#00798C",
  "#30638E",
  "#66A182",
  "#1B1B1F",
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]";

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
          console.error("Kunde inte hämta profildata:", err);
          setError("Kunde inte ladda all profilinformation.");
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
    if (!window.confirm("Vill du ta bort den här recensionen?")) {
      return;
    }

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
    setEditReviewText(review.text);
    setEditReviewRating(review.rating);
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

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div
        className={`flex min-h-[60vh] items-center justify-center bg-[#FAFAFA] ${FONT}`}
      >
        <div className="flex items-center gap-3 text-[#52525B]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#30638E] border-t-transparent" />
          <span className="text-sm font-semibold">
            Laddar din profil...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#1B1B1F] ${FONT}`}>

      {/* PROFILHEADER */}
      <header className="border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:pt-14">

          {/* TILLBAKA */}
          <Link
            to="/"
            className={`mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#71717A] transition-colors hover:text-[#1B1B1F] ${focusRing}`}
          >
            <span aria-hidden="true">←</span>
            Tillbaka till biblioteket
          </Link>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

            {/* PROFILINFORMATION */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* AVATAR */}
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#30638E] text-4xl font-extrabold text-white shadow-sm">
                  {username?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#EDAE49] text-lg">
                  📚
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#00798C]">
                  Min läsprofil
                </p>

                <h1 className="break-words text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {username}
                </h1>

                <p className="mt-3 text-sm text-[#71717A]">
                  Din egen plats för böcker, recensioner och läsmål.
                </p>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  value: reviews.length,
                  label: "Recensioner",
                  color: "#D1495B",
                },
                {
                  value: wantToReadBooks.length,
                  label: "Vill läsa",
                  color: "#00798C",
                },
                {
                  value: averageRating,
                  label: "Snittbetyg",
                  color: "#EDAE49",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-4 sm:min-w-[115px]"
                >
                  <div
                    className="mb-3 h-1 w-8 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />

                  <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-[#71717A]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FÄRGAD BOKHYLLA */}
        <div className="flex h-1.5">
          {SPINES.map((color) => (
            <div
              key={color}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </header>

      {/* HUVUDINNEHÅLL */}
      <main className="mx-auto max-w-7xl px-4 py-10">

        {/* FELMEDDELANDE */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm text-[#B91C1C]"
          >
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              aria-label="Stäng felmeddelande"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* LÄSTRACKER */}
        <ReadingTracker />

        {/* SEKTIONSTITEL */}
        <div className="mb-6 mt-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#00798C]">
            Mitt bibliotek
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Mina böcker & recensioner
          </h2>

          <p className="mt-2 text-sm text-[#71717A]">
            Håll koll på dina tankar och böcker du vill läsa.
          </p>
        </div>

        {/* FLIKAR */}
        <div
          role="tablist"
          aria-label="Profilinnehåll"
          className="mb-8 flex flex-wrap gap-2 border-b border-[#E4E4E7] pb-4"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${focusRing} ${
              activeTab === "reviews"
                ? "bg-[#1B1B1F] text-white"
                : "border border-[#D4D4D8] bg-white text-[#52525B] hover:border-[#1B1B1F] hover:text-[#1B1B1F]"
            }`}
          >
            Mina recensioner
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeTab === "reviews"
                  ? "bg-white/20 text-white"
                  : "bg-[#F4F4F5] text-[#71717A]"
              }`}
            >
              {reviews.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "wantToRead"}
            onClick={() => setActiveTab("wantToRead")}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${focusRing} ${
              activeTab === "wantToRead"
                ? "bg-[#1B1B1F] text-white"
                : "border border-[#D4D4D8] bg-white text-[#52525B] hover:border-[#1B1B1F] hover:text-[#1B1B1F]"
            }`}
          >
            Vill läsa
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeTab === "wantToRead"
                  ? "bg-white/20 text-white"
                  : "bg-[#F4F4F5] text-[#71717A]"
              }`}
            >
              {wantToReadBooks.length}
            </span>
          </button>
        </div>

        {/* RECENSIONER */}
        {activeTab === "reviews" && (
          <section role="tabpanel">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-white px-6 py-16 text-center">
                <div className="mb-4 text-4xl">✍️</div>

                <h3 className="text-xl font-extrabold">
                  Inga recensioner än
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#71717A]">
                  När du recenserar en bok dyker den upp här.
                  Börja med att utforska biblioteket.
                </p>

                <Link
                  to="/"
                  className={`mt-6 inline-flex rounded-full bg-[#1B1B1F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3A3A42] ${focusRing}`}
                >
                  Utforska böcker
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {reviews.map((review, index) => {
                  const isEditing = editingReviewId === review.id;
                  const color = SPINES[index % SPINES.length];

                  return (
                    <article
                      key={review.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-1 gap-4 p-5 sm:p-6">

                        {/* OMSLAG */}
                        <Link
                          to={`/books/${review.book_id}`}
                          className="group relative block w-20 shrink-0 self-start"
                        >
                          <div
                            className="absolute bottom-0 left-0 top-0 z-10 w-1.5 rounded-l-sm"
                            style={{ backgroundColor: color }}
                          />

                          {review.cover_url ? (
                            <img
                              src={review.cover_url}
                              alt={`Omslag till ${review.book_title}`}
                              className="aspect-[2/3] w-full rounded-md object-cover shadow-sm transition-transform group-hover:-translate-y-1"
                            />
                          ) : (
                            <div
                              className="flex aspect-[2/3] items-center justify-center rounded-md p-2 text-center text-xs font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {review.book_title}
                            </div>
                          )}
                        </Link>

                        {/* RECENSIONSINNEHÅLL */}
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${review.book_id}`}
                            className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-[#1B1B1F] transition-colors hover:text-[#30638E]"
                          >
                            {review.book_title}
                          </Link>

                          {isEditing ? (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="mb-2 block text-xs font-bold text-[#52525B]">
                                  Ditt betyg
                                </label>

                                <StarRating
                                  rating={editReviewRating}
                                  onRate={setEditReviewRating}
                                  size="sm"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`review-${review.id}`}
                                  className="mb-2 block text-xs font-bold text-[#52525B]"
                                >
                                  Din recension
                                </label>

                                <textarea
                                  id={`review-${review.id}`}
                                  rows={4}
                                  value={editReviewText}
                                  onChange={(e) =>
                                    setEditReviewText(e.target.value)
                                  }
                                  className="w-full resize-y rounded-xl border border-[#D4D4D8] bg-white p-3 text-sm outline-none focus:border-[#30638E] focus:ring-2 focus:ring-[#30638E]/20"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateReview(review.id)
                                  }
                                  disabled={savingReview}
                                  className="rounded-full bg-[#1B1B1F] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#3A3A42] disabled:opacity-50"
                                >
                                  {savingReview
                                    ? "Sparar..."
                                    : "Spara ändringar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEditingReview}
                                  className="rounded-full border border-[#D4D4D8] bg-white px-5 py-2 text-xs font-semibold text-[#52525B] hover:border-[#1B1B1F]"
                                >
                                  Avbryt
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mt-3 flex items-center gap-2">
                                <StarRating
                                  rating={review.rating}
                                  size="sm"
                                />

                                <span className="text-xs font-bold text-[#71717A]">
                                  {review.rating}/5
                                </span>
                              </div>

                              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#52525B]">
                                {review.text}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* KORTFOOTER */}
                      {!isEditing && (
                        <div className="flex items-center justify-between gap-3 border-t border-[#E4E4E7] bg-[#FAFAFA] px-5 py-3 sm:px-6">
                          <span className="text-xs font-semibold text-[#71717A]">
                            Min recension
                          </span>

                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                startEditingReview(review)
                              }
                              className={`text-xs font-bold text-[#30638E] hover:underline ${focusRing}`}
                            >
                              Redigera
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteReview(review.id)
                              }
                              className={`text-xs font-bold text-[#D1495B] hover:underline ${focusRing}`}
                            >
                              Ta bort
                            </button>
                          </div>
                        </div>
                      )}

                      {/* FÄRGAD DETALJ */}
                      <div
                        className="h-1"
                        style={{ backgroundColor: color }}
                      />
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* VILL LÄSA */}
        {activeTab === "wantToRead" && (
          <section role="tabpanel">
            {wantToReadBooks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-white px-6 py-16 text-center">
                <div className="mb-4 text-4xl">📚</div>

                <h3 className="text-xl font-extrabold">
                  Din läslista är tom
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#71717A]">
                  Hittat en bok du vill läsa? Lägg till den i din
                  läslista så dyker den upp här.
                </p>

                <Link
                  to="/"
                  className={`mt-6 inline-flex rounded-full bg-[#1B1B1F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3A3A42] ${focusRing}`}
                >
                  Hitta böcker
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {wantToReadBooks.map((book, index) => {
                  const color = SPINES[index % SPINES.length];

                  return (
                    <article
                      key={book.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <Link
                        to={`/books/${book.id}`}
                        className="flex flex-1 flex-col p-3 sm:p-4"
                      >
                        {/* BOKOMSLAG */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#F4F4F5]">
                          <div
                            className="absolute bottom-0 left-0 top-0 z-10 w-1.5"
                            style={{ backgroundColor: color }}
                          />

                          {book.cover_url ? (
                            <img
                              src={book.cover_url}
                              alt={`Omslag till ${book.title}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center px-3 text-center text-sm font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {book.title}
                            </div>
                          )}
                        </div>

                        {/* BOKINFORMATION */}
                        <div className="mt-4">
                          <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-[#1B1B1F] transition-colors group-hover:text-[#30638E]">
                            {book.title}
                          </h3>

                          <p className="mt-1 line-clamp-1 text-xs text-[#71717A]">
                            av {book.author}
                          </p>
                        </div>
                      </Link>

                      <div className="border-t border-[#E4E4E7] px-3 py-3 sm:px-4">
                        <Link
                          to={`/books/${book.id}`}
                          className={`block rounded-full border border-[#D4D4D8] bg-[#FAFAFA] px-3 py-2 text-center text-xs font-bold text-[#1B1B1F] transition-colors hover:border-[#1B1B1F] hover:bg-[#1B1B1F] hover:text-white ${focusRing}`}
                        >
                          Skriv recension ↗
                        </Link>
                      </div>

                      <div
                        className="h-1"
                        style={{ backgroundColor: color }}
                      />
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[#E4E4E7] bg-white py-6 text-center text-sm text-[#71717A]">
        © 2026 MyReads. Byggd för böcker.
      </footer>
    </div>
  );
}
