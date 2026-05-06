import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="flex gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
    >
      <img
        src={book.cover_url || `https://covers.openlibrary.org/b/id/1-M.jpg`}
        alt={book.title}
        className ="w-16 h-24 object-cover rounded shadow-sm flex-shrink-0 bg-gray-200" 
        onError= {(e) => (e.target.src = "https://via.placeholder.com/64x64?text=Bok")}
      />

      <div className="flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[#382110] text-lg leading-tight">
            {book.title}
          </h3>
          <p className="text-gray-500 text-sm">{book.author}</p>
          {book.genre && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#f4f1ea] text-[#382110] text-xs rounded-full border border-[#d4c5a9]">
              {book.genre}
            </span>
          )}
          {book.pages ? (
  <p className="text-xs text-gray-400">{book.pages} sidor</p>
) : null}

          {book.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {book.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(book.avg_rating || 0)} />
          <span className="text-xs text-gray-400">
            {book.review_count} recensioner
          </span>
        </div>
      </div>
    </Link>
  );
}
