
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const SPINES = [
  "#D1495B",
  "#EDAE49",
  "#00798C",
  "#30638E",
  "#66A182",
  "#1B1B1F",
];

export default function ReadingTracker() {
  const [readingList, setReadingList] = useState([]);
  const [updatePages, setUpdatePages] = useState({});
  const [updating, setUpdating] = useState({});
  const [messages, setMessages] = useState({});

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;

    api
      .get("/books/my/reading-progress")
      .then((r) => {
        if (active) setReadingList(r.data);
      })
      .catch((err) =>
        console.error("Kunde inte hämta lässtatus:", err)
      );

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
      (totalPages && newPage > totalPages)
    ) {
      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "error",
          text: totalPages
            ? `Ange en sida mellan 0 och ${totalPages}.`
            : "Ange ett giltigt sidnummer.",
        },
      }));
      return;
    }

    setUpdating((prev) => ({ ...prev, [bookId]: true }));

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
          text: "Lässtatus uppdaterad!",
        },
      }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [bookId]: {
          type: "error",
          text:
            err.response?.data?.error ||
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

  if (!isLoggedIn || readingList.length === 0) return null;

  return (
    <section
      className={`mb-8 overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white ${FONT}`}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E4E7] bg-[#FAFAFA] px-6 py-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#00798C]">
            Min läsresa
          </p>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#1B1B1F] sm:text-3xl">
            Just nu läser jag
            <span className="ml-3 align-middle text-base font-medium text-[#71717A]">
              {readingList.length}
            </span>
          </h2>

          <p className="mt-2 text-sm text-[#71717A]">
            Följ dina framsteg, en sida i taget.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F3F4] text-2xl">
          
        </div>
      </div>

      {/* BOKLISTA */}
      <div className="divide-y divide-[#E4E4E7]">
        {readingList.map((item, index) => {
          const totalPages = Number(item.page_count);
          const currentPage = Number(item.current_page) || 0;
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

          const color = SPINES[index % SPINES.length];
          const message = messages[item.book_id];

          return (
            <article
              key={item.book_id}
              className="p-5 transition-colors hover:bg-[#FAFAFA] sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                {/* BOKOMSLAG */}
                <Link
                  to={`/books/${item.book_id}`}
                  className="group relative block w-20 shrink-0 self-start"
                >
                  <div
                    className="absolute bottom-0 left-0 top-0 z-10 w-1.5 rounded-l-sm"
                    style={{ backgroundColor: color }}
                  />

                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={`Omslag till ${item.title}`}
                      className="aspect-[2/3] w-full rounded-md object-cover shadow-md transition-transform duration-200 group-hover:-translate-y-1"
                    />
                  ) : (
                    <div
                      className="flex aspect-[2/3] items-center justify-center rounded-md px-2 text-center text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {item.title}
                    </div>
                  )}
                </Link>

                {/* BOKINFORMATION */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/books/${item.book_id}`}
                    className="text-lg font-extrabold leading-snug tracking-tight text-[#1B1B1F] transition-colors hover:text-[#30638E]"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1 text-sm text-[#71717A]">
                    av {item.author}
                  </p>

                  {/* LÄSFRAMSTEG */}
                  <div className="mt-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#52525B]">
                        Sida {currentPage}
                        {hasPageCount
                          ? ` av ${totalPages}`
                          : " · Okänt sidantal"}
                      </span>

                      {percentage !== null && (
                        <span
                          className="text-sm font-extrabold"
                          style={{ color: "#00798C" }}
                        >
                          {percentage}% klart
                        </span>
                      )}
                    </div>

                    <div
                      className="h-2.5 w-full overflow-hidden rounded-full bg-[#E4E4E7]"
                      role="progressbar"
                      aria-label={`Läsframsteg för ${item.title}`}
                      aria-valuenow={percentage ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext={
                        percentage !== null
                          ? `${percentage} procent klart`
                          : `Sida ${currentPage}, totalt sidantal okänt`
                      }
                    >
                      <div
                        className="h-full rounded-full bg-[#00798C] transition-all duration-500 ease-out"
                        style={{
                          width: `${percentage ?? 0}%`,
                        }}
                      />
                    </div>

                    {percentage === 100 && (
                      <p className="mt-2 text-xs font-bold text-[#00798C]">
                        ✓ Du har nått sista sidan!
                      </p>
                    )}
                  </div>

                  {/* UPPDATERA SIDNUMMER */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePageUpdate(
                        item.book_id,
                        hasPageCount ? totalPages : null
                      );
                    }}
                    className="mt-5 flex flex-wrap items-end gap-3"
                  >
                    <div className="min-w-0 flex-1 sm:max-w-[160px]">
                      <label
                        htmlFor={`page-${item.book_id}`}
                        className="mb-2 block text-xs font-bold text-[#52525B]"
                      >
                        Uppdatera sida
                      </label>

                      <input
                        id={`page-${item.book_id}`}
                        type="number"
                        min="0"
                        max={hasPageCount ? totalPages : undefined}
                        step="1"
                        placeholder="Sidnummer"
                        value={updatePages[item.book_id] ?? ""}
                        onChange={(e) => {
                          setUpdatePages((prev) => ({
                            ...prev,
                            [item.book_id]: e.target.value,
                          }));

                          setMessages((prev) => ({
                            ...prev,
                            [item.book_id]: null,
                          }));
                        }}
                        className="w-full rounded-full border border-[#D4D4D8] bg-white px-4 py-2.5 text-sm text-[#1B1B1F] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#30638E] focus:ring-2 focus:ring-[#30638E]/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating[item.book_id]}
                      className="rounded-full bg-[#1B1B1F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3A3A42] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating[item.book_id]
                        ? "Sparar..."
                        : "Uppdatera"}
                    </button>
                  </form>

                  {/* FEEDBACK */}
                  {message && (
                    <p
                      role="status"
                      className={`mt-3 text-xs font-semibold ${
                        message.type === "success"
                          ? "text-[#00798C]"
                          : "text-[#D1495B]"
                      }`}
                    >
                      {message.type === "success" ? "✓ " : "⚠ "}
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#E4E4E7] bg-[#FAFAFA] px-6 py-4">
        <p className="text-center text-xs text-[#71717A]">
          {readingList.length === 1
            ? "Du har 1 bok på gång. Fortsätt läsa!"
            : `Du har ${readingList.length} böcker på gång. Fortsätt läsa!`}
        </p>
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
    </section>
  );
}
