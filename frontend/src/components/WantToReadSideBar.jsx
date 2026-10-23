
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

export default function WantToReadSidebar() {
  const [books, setBooks] = useState([]);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) return;

    api
      .get("/books/my/want-to-read")
      .then((r) => setBooks(r.data))
      .catch((err) =>
        console.error("Kunde inte hämta läslistan:", err)
      );
  }, [isLoggedIn]);

  if (!isLoggedIn || books.length === 0) return null;

  return (
    <aside
      className={`w-full lg:w-[280px] lg:sticky lg:top-6 ${FONT}`}
    >
      <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">

        {/* HEADER */}
        <div className="border-b border-[#E4E4E7] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
                Din läslista
              </p>

              <h3 className="text-xl font-extrabold tracking-tight text-[#1B1B1F]">
                Vill läsa
              </h3>
            </div>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#1B1B1F] px-2 text-sm font-bold text-white">
              {books.length}
            </span>
          </div>
        </div>

        {/* BÖCKER */}
        <div className="divide-y divide-[#F0F0F2]">
          {books.map((book, index) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="group flex items-start gap-3 p-4 transition-colors hover:bg-[#FAFAFA]"
            >
              {/* BOKOMSLAG */}
              <div className="relative w-[65px] shrink-0">
                <div
                  className="absolute bottom-0 left-0 top-0 z-10 w-1 rounded-l-sm"
                  style={{
                    backgroundColor: SPINES[index % SPINES.length],
                  }}
                />

                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={`Omslag till ${book.title}`}
                    className="aspect-[2/3] w-full rounded-md object-cover shadow-sm transition-transform duration-200 group-hover:-translate-y-1"
                  />
                ) : (
                  <div
                    className="flex aspect-[2/3] items-center justify-center rounded-md px-2 text-center text-xs font-bold text-white shadow-sm"
                    style={{
                      backgroundColor: SPINES[index % SPINES.length],
                    }}
                  >
                    {book.title}
                  </div>
                )}
              </div>

              {/* BOKINFORMATION */}
              <div className="min-w-0 flex-1 py-1">
                <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#1B1B1F] transition-colors group-hover:text-[#30638E]">
                  {book.title}
                </h4>

                <p className="mt-1 line-clamp-1 text-xs text-[#71717A]">
                  av {book.author}
                </p>

                {book.genre && (
                  <span className="mt-3 inline-block max-w-full truncate rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold text-[#52525B]">
                    {book.genre}
                  </span>
                )}
              </div>

              {/* PIL */}
              <span
                aria-hidden="true"
                className="mt-1 text-sm text-[#A1A1AA] transition-all group-hover:translate-x-1 group-hover:text-[#1B1B1F]"
              >
                ↗
              </span>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#E4E4E7] bg-[#FAFAFA] px-5 py-4">
          <p className="text-center text-xs leading-relaxed text-[#71717A]">
            {books.length === 1
              ? "1 bok väntar på att bli läst."
              : `${books.length} böcker väntar på att bli lästa.`}
          </p>
        </div>

        {/* FÄRGAD BOKHYLLA */}
        <div className="flex h-1.5">
          {SPINES.map((color, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
