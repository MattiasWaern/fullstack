import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="flex gap-4 p-4 bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] hover:border-[#b5a58c] hover:shadow-sm transition-all duration-200 group"
    >
      {/* Book Cover */}
      <div className="relative flex-shrink-0">
        <img
          src={
            book.cover_url ||
            "https://via.placeholder.com/64x96?text=Bok"
          }
          alt={book.title}
          className="w-16 h-24 object-cover rounded-sm shadow-[2px_2px_4px_rgba(0,0,0,0.15)]"
        />
        {/* "currently reading" shelf indicator */}
        {book.currently_reading && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#409D69] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Book Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          {/* Title  */}
          <h3 className="font-['Georgia',_'Times_New_Roman',_serif'] font-bold text-[#382110] text-lg leading-tight group-hover:text-[#00635d] group-hover:underline transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-[#00635d] text-sm mt-0.5 hover:underline">
            {book.author}
          </p>

          {/* Rating Stars  */}
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={Math.round(book.avg_rating || 0)} />
            <span className="text-xs text-[#767676]">
              {book.avg_rating ? book.avg_rating.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-[#999]">
              · {book.review_count || 0} recensioner
            </span>
            {book.pages && (
              <span className="text-xs text-[#999]">
                · {book.pages} sidor
              </span>
            )}
          </div>

          {/* Genre Tags  */}
          {book.genre && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-block px-2.5 py-0.5 bg-[#f4f1ea] text-[#382110] text-xs rounded-full border border-[#d8d1c6] hover:bg-[#ede6d6] transition-colors">
                {book.genre}
              </span>
            </div>
          )}

          {/* Description  */}
          {book.description && (
            <p className="text-xs text-[#555] mt-2 line-clamp-2 leading-relaxed italic">
              {book.description}
            </p>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#f0ece3]">
          {/* Reading progress bar (if available) */}
          {book.reading_progress !== undefined && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 bg-[#f0ece3] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#409D69] rounded-full transition-all duration-300"
                  style={{ width: `${book.reading_progress}%` }}
                />
              </div>
              <span className="text-xs text-[#767676] whitespace-nowrap">
                {book.reading_progress}%
              </span>
            </div>
          )}

          {/* Date added/read */}
          {book.date_read && (
            <span className="text-xs text-[#999]">
              Läst {book.date_read}
            </span>
          )}

          {/* Book format */}
          {book.format && (
            <span className="text-xs text-[#999] px-1.5 py-0.5 bg-[#f8f8f5] rounded border border-[#e8e4d9]">
              {book.format}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}