import { Link, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  const navigate = useNavigate();

  // Funktion för att hantera klick på redigera-knappen utan att trigga Link-komponenten
  const handleEditClick = (e) => {
    e.preventDefault(); // Hindrar Link från att navigera till detaljsidan
    e.stopPropagation(); // Hindrar klick-eventet från att bubbla upp
    navigate(`/books/${book.id}?edit=true`); 
  };

  return (
    <Link
      to={`/books/${book.id}`}
      className="flex gap-4 p-4 bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] hover:border-[#b5a58c] hover:shadow-sm transition-all duration-200 group relative"
    >
      {/* Edit Button - Visas vid hover */}
      <button
        onClick={handleEditClick}
        className="absolute top-2 right-2 p-2 bg-white rounded-full border border-[#d8d1c6] text-[#767676] hover:text-[#00635d] hover:border-[#00635d] opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
        title="Redigera bok"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Book Cover */}
      <div className="relative flex-shrink-0">
        <img
          src={book.cover_url || "https://via.placeholder.com/64x96?text=Bok"}
          alt={book.title}
          className="w-16 h-24 object-cover rounded-sm shadow-[2px_2px_4px_rgba(0,0,0,0.15)]"
        />
        {book.currently_reading && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#409D69] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Book Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="font-['Georgia',_serif] font-bold text-[#382110] text-lg leading-tight group-hover:text-[#00635d] group-hover:underline transition-colors pr-6">
            {book.title}
          </h3>

          <p className="text-[#00635d] text-sm mt-0.5 hover:underline">
            {book.author}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={Math.round(book.avg_rating || 0)} />
            <span className="text-xs text-[#767676]">
              {book.avg_rating ? book.avg_rating.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-[#999]">
              · {book.review_count || 0} recensioner
            </span>
            {book.page_count && (
              <span className="text-xs text-[#999]">· {book.page_count} sidor</span>
            )}
          </div>

          {/* Genre Tags (med CamelCase-fix) */}
          {book.genre && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.genre
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .split(/[, ]+/)
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i)
                .slice(0, 3)
                .map((g, i) => (
                  <span
                    key={i}
                    className="bg-[#f4f1ea] text-[#382110] text-[10px] font-bold px-2 py-0.5 rounded border border-[#d8d1c6] uppercase tracking-wide"
                  >
                    {g}
                  </span>
                ))}
              {book.genre.split(/[, ]+/).filter(Boolean).length > 3 && (
                <span className="text-[10px] text-gray-400 self-center">+fler</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#f0ece3]">
          <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold">
            {book.isbn ? `ISBN: ${book.isbn}` : 'Ingen ISBN'}
          </span>
        </div>
      </div>
    </Link>
  );
}