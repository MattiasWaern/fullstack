import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import StarRating from "../components/StarRating";
import { useLocation } from "react-router-dom";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "true") {
      setIsEditing(true);
    }
  }, [location]);

  // States
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isWantToRead, setIsWantToRead] = useState(false);
  const [isReading, setIsReading] = useState(false); // Ny!

  // Form states
  const [rating, setRating] = useState(3);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  // States för redigering av recensioner
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(3);

  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Funktion för att hämta om recensioner separat vid uppdatering
  const fetchReviews = () => {
    api
      .get(`/books/${id}/reviews`)
      .then((r) => setReviews(r.data))
      .catch((err) => console.error("Fel vid hämtning av recensioner:", err));
  };

  useEffect(() => {
    api
      .get(`/books/${id}`)
      .then((r) => {
        setBook(r.data);
        setEditData(r.data);
      })
      .catch((err) => console.error("Fel vid hämtning av bok:", err));

    fetchReviews();

    if (isLoggedIn) {
      // Hämta Want to read status
      api
        .get(`/books/${id}/want-to-read-status`)
        .then((r) => {
          setIsWantToRead(r.data.isWantToRead);
        })
        .catch((err) => console.error("Kunde inte hämta lässtatus:", err));

      // Nytt: Kolla om boken redan finns under pågående läsning
      api
        .get('/books/my/reading-progress')
        .then((r) => {
          const currentlyReading = r.data.some(item => item.book_id === parseInt(id));
          setIsReading(currentlyReading);
        })
        .catch((err) => console.error("Kunde inte hämta pågående lässtatus:", err));
    }
  }, [id, isLoggedIn]);

  const toggleWantToRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isWantToRead) {
        await api.delete(`/books/${book.id}/want-to-read`);
        setIsWantToRead(false);
      } else {
        await api.post(`/books/${book.id}/want-to-read`);
        setIsWantToRead(true);
      }
    } catch (err) {
      console.error("Kunde inte uppdatera läslistan");
    }
  };

  // Ny funktion för att börja läsa boken på sida 0
  const startReadingBook = async () => {
    try {
      await api.post(`/books/${id}/progress`, { current_page: 0 });
      setIsReading(true);
      // Om boken fanns i Want to read kan vi också ta bort den därifrån (valfritt)
      if (isWantToRead) {
        await api.delete(`/books/${id}/want-to-read`);
        setIsWantToRead(false);
      }
    } catch (err) {
      console.error("Kunde inte starta läsningen", err);
      setError("Kunde inte starta läsningen av boken.");
    }
  };

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.put(`/books/${id}`, editData);
      setBook({ ...book, ...editData });
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Kunde inte uppdatera boken");
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/reviews", {
        book_id: id,
        rating,
        text,
      });
      setReviews((prev) => [{ ...data, username }, ...prev]);
      setText("");
      setRating(3);
    } catch (err) {
      setError(err.response?.data?.error || "Något gick fel");
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Vill du ta bort din recension?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.error || "Kunde inte ta bort recensionen");
    }
  }

  async function handleUpdateReview(reviewId) {
    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editReviewRating,
        text: editReviewText,
      });
      setEditingReviewId(null);
      fetchReviews(); 
    } catch (err) {
      alert(err.response?.data?.error || "Kunde inte uppdatera recensionen");
    }
  }

  async function deleteBook() {
    if (!window.confirm(`Är du säker på att du vill ta bort "${book.title}"?`))
      return;
    try {
      await api.delete(`/books/${id}`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Kunde inte ta bort boken");
    }
  }

  const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]";
  const inputClass = `w-full rounded-xl border border-[#D4D4D8] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#30638E] ${focusRing}`;
  const primaryButton = `rounded-full bg-[#1B1B1F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3A3A42] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
  const secondaryButton = `rounded-full border border-[#D4D4D8] bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[#1B1B1F] ${focusRing}`;
  const spineColors = ["#D1495B", "#EDAE49", "#00798C", "#30638E", "#66A182", "#1B1B1F"];
  const spineColor = spineColors[(Number(id) || 0) % spineColors.length];

  if (!book) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA]">
      <div role="status" aria-label="Laddar bok" className="h-9 w-9 animate-spin rounded-full border-4 border-[#E4E4E7] border-t-[#30638E]" />
    </div>
  );

  const isOwner = username === book.created_by_username;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1B1B1F] font-['Bricolage_Grotesque',system-ui,sans-serif]">
      <header className="border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 md:pt-16">
          <Link to="/" className={`mb-8 inline-flex text-sm font-semibold text-[#30638E] hover:underline ${focusRing}`}>← Tillbaka till biblioteket</Link>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-12">
            <div className="relative w-40 shrink-0 sm:w-48">
              {book.cover_url ? (
                <img src={book.cover_url} alt={`Omslag till ${book.title}`} className="aspect-[2/3] w-full rounded-md border border-[#E4E4E7] object-cover shadow-xl" />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-md p-5 text-center text-lg font-extrabold text-white shadow-xl" style={{ backgroundColor: spineColor }}>{book.title}</div>
              )}
              <div className="absolute -bottom-2 left-2 right-2 -z-10 h-4 rounded-full bg-black/10 blur-md" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#00798C]">Ur biblioteket</p>
              <h1 className="mb-3 max-w-3xl break-words text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{book.title}</h1>
              <p className="mb-6 text-xl text-[#52525B]">av <span className="font-semibold text-[#1B1B1F]">{book.author}</span></p>
              <div className="flex flex-wrap items-center gap-3">
                <StarRating rating={Math.round(Number(avgRating))} size="lg" />
                <span className="text-xl font-extrabold">{avgRating}</span>
                <span className="text-sm text-[#71717A]">({reviews.length} recensioner)</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {(book.genre || "").split(/[, ]+/).filter(Boolean).map((g, i) => <span key={`${g}-${i}`} className="rounded-full border border-[#D4D4D8] bg-[#FAFAFA] px-3 py-1 text-xs font-semibold">{g}</span>)}
                {book.page_count && <span className="rounded-full border border-[#D4D4D8] bg-[#FAFAFA] px-3 py-1 text-xs font-semibold">{book.page_count} sidor</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="h-2 bg-[#1B1B1F]" />
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <main className="min-w-0 space-y-8">
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

          <section className="rounded-2xl border border-[#E4E4E7] bg-white p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-5">
                <h2 className="text-2xl font-extrabold tracking-tight">Redigera bokdetaljer</h2>
                <div><label className="mb-2 block text-sm font-semibold" htmlFor="edit-title">Titel</label><input id="edit-title" required className={inputClass} value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} /></div>
                <div><label className="mb-2 block text-sm font-semibold" htmlFor="edit-author">Författare</label><input id="edit-author" required className={inputClass} value={editData.author || ""} onChange={e => setEditData({ ...editData, author: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-semibold" htmlFor="edit-genre">Genre</label><input id="edit-genre" className={inputClass} value={editData.genre || ""} onChange={e => setEditData({ ...editData, genre: e.target.value })} /></div>
                  <div><label className="mb-2 block text-sm font-semibold" htmlFor="edit-pages">Antal sidor</label><input id="edit-pages" type="number" min="0" className={inputClass} value={editData.page_count ?? ""} onChange={e => setEditData({ ...editData, page_count: e.target.value })} /></div>
                </div>
                <div><label className="mb-2 block text-sm font-semibold" htmlFor="edit-description">Beskrivning</label><textarea id="edit-description" rows={5} className={inputClass} value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })} /></div>
                <div className="flex flex-wrap gap-3"><button type="submit" className={primaryButton}>Spara ändringar</button><button type="button" onClick={() => setIsEditing(false)} className={secondaryButton}>Avbryt</button></div>
              </form>
            ) : (
              <>
                <h2 className="mb-5 text-3xl font-extrabold tracking-tight">Om boken</h2>
                {book.description ? <p className="whitespace-pre-line text-base leading-8 text-[#52525B]">{book.description}</p> : <p className="text-[#71717A]">Ingen beskrivning har lagts till än.</p>}
              </>
            )}
          </section>

          <section className="rounded-2xl border border-[#E4E4E7] bg-white p-6 md:p-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-[#E4E4E7] pb-6">
              <div><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#00798C]">Vad tycker läsarna?</p><h2 className="text-3xl font-extrabold tracking-tight">Recensioner <span className="text-xl font-normal text-[#71717A]">{reviews.length}</span></h2></div>
              <div className="flex items-center gap-2"><StarRating rating={Math.round(Number(avgRating))} size="sm" /><strong>{avgRating}</strong></div>
            </div>

            {isLoggedIn ? (
              <form onSubmit={submitReview} className="mb-10 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-5 sm:p-6">
                <h3 className="mb-4 text-lg font-extrabold">Skriv en recension</h3>
                <div className="mb-4"><label className="mb-2 block text-sm font-semibold">Ditt betyg</label><StarRating rating={rating} onRate={setRating} size="lg" /></div>
                <label htmlFor="review-text" className="sr-only">Din recension</label>
                <textarea id="review-text" rows={4} placeholder="Vad tyckte du om boken?" value={text} onChange={e => setText(e.target.value)} required className={`${inputClass} mb-4`} />
                <button type="submit" className={primaryButton}>Posta recension</button>
              </form>
            ) : <p className="mb-8 rounded-xl bg-[#FAFAFA] p-5 text-sm text-[#52525B]"><Link to="/register" className="font-semibold text-[#30638E] underline">Skapa konto</Link> för att skriva en recension.</p>}

            <div className="space-y-5">
              {reviews.length === 0 && <p className="py-6 text-[#71717A]">Inga recensioner än. Bli först med att recensera!</p>}
              {reviews.map(r => {
                const isMyReview = isLoggedIn && r.username === username;
                const isCurrentlyEditing = editingReviewId === r.id;
                return (
                  <article key={r.id} className="rounded-2xl border border-[#E4E4E7] p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#30638E] font-extrabold text-white">{(r.username || "?").charAt(0).toUpperCase()}</div>
                        <div><p className="font-bold">{r.username}</p>{!isCurrentlyEditing && <StarRating rating={r.rating} size="sm" />}</div>
                      </div>
                      {isMyReview && !isCurrentlyEditing && <div className="flex gap-3 text-sm"><button type="button" className={`font-semibold text-[#30638E] hover:underline ${focusRing}`} onClick={() => { setEditingReviewId(r.id); setEditReviewText(r.text); setEditReviewRating(r.rating); }}>Redigera</button><button type="button" className={`font-semibold text-[#D1495B] hover:underline ${focusRing}`} onClick={() => handleDeleteReview(r.id)}>Ta bort</button></div>}
                    </div>
                    {isCurrentlyEditing ? (
                      <div className="space-y-4"><div><p className="mb-2 text-sm font-semibold">Ändra betyg</p><StarRating rating={editReviewRating} onRate={setEditReviewRating} size="sm" /></div><label htmlFor={`review-edit-${r.id}`} className="sr-only">Redigera recension</label><textarea id={`review-edit-${r.id}`} rows={3} className={inputClass} value={editReviewText} onChange={e => setEditReviewText(e.target.value)} /><div className="flex flex-wrap justify-end gap-2"><button type="button" className={secondaryButton} onClick={() => setEditingReviewId(null)}>Avbryt</button><button type="button" className={primaryButton} onClick={() => handleUpdateReview(r.id)}>Spara</button></div></div>
                    ) : <p className="whitespace-pre-line leading-7 text-[#52525B]">{r.text}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-[#E4E4E7] bg-white p-6">
            <h2 className="mb-2 text-xl font-extrabold">Din läshylla</h2>
            <p className="mb-6 text-sm leading-6 text-[#71717A]">Spara boken eller börja läsa direkt.</p>
            {isLoggedIn ? (
              <div className="space-y-3">
                <button type="button" onClick={toggleWantToRead} aria-pressed={isWantToRead} className={`w-full ${isWantToRead ? secondaryButton : primaryButton}`}>{isWantToRead ? "✓ Vill läsa" : "+ Vill läsa"}</button>
                <button type="button" onClick={startReadingBook} disabled={isReading} className={`w-full ${secondaryButton}`}>{isReading ? "✓ Läser just nu" : "Börja läsa →"}</button>
              </div>
            ) : <Link to="/register" className={`block text-center ${primaryButton}`}>Skapa konto gratis</Link>}
          </div>
          {isOwner && !isEditing && <div className="rounded-2xl border border-[#E4E4E7] bg-white p-6"><h2 className="mb-4 text-lg font-extrabold">Hantera bok</h2><div className="flex flex-col gap-3"><button type="button" className={secondaryButton} onClick={() => { setIsEditing(true); setEditData(book); }}>Redigera bok</button><button type="button" className={`rounded-full border border-[#D1495B]/30 px-5 py-2.5 text-sm font-semibold text-[#D1495B] hover:bg-red-50 ${focusRing}`} onClick={deleteBook}>Ta bort bok</button></div></div>}
          <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white"><div className="flex h-20 items-end justify-center gap-1 px-5 pt-4">{spineColors.map((color, i) => <div key={color} style={{ backgroundColor: color, height: 38 + (i % 3) * 12 }} className="w-7 rounded-t-sm" />)}</div><div className="h-2 bg-[#1B1B1F]" /><p className="px-5 py-4 text-center text-sm font-semibold">Varje bok har sin plats.</p></div>
        </aside>
      </div>
      <footer className="mt-12 border-t border-[#E4E4E7] py-6 text-center text-sm text-[#71717A]">© 2026 MyReads. Byggd för böcker.</footer>
    </div>
  );
}
