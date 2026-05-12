import { Link, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import api from '../api';

export default function BookCard({ book, onDelete }) {
  const navigate = useNavigate();

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/books/${book.id}?edit=true`);
  };

const handleDeleteClick = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (window.confirm(`Är du säker på att du vill ta bort "${book.title}"?`)) {
    try {
      // Här skickas nu anropet till: [DIN_BASE_URL]/books/[ID]
      // Vilket i din setup blir: http://localhost:3001/api/books/[ID]
      const response = await api.delete(`/books/${book.id}`);

      if (response.status === 200 || response.status === 204) {
        onDelete(book.id); // Tar bort boken från listan i Home.jsx
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Något gick fel när boken skulle tas bort.");
    }
  }
};

  return (
    <Link
      to={`/books/${book.id}`}
      className="flex gap-4 p-4 bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] hover:border-[#b5a58c] hover:shadow-sm transition-all duration-200 group relative"
    >
      {/* Knapp-container (överst till höger) */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {/* Redigera-knapp */}
        <button
          onClick={handleEditClick}
          className="p-2 bg-white rounded-full border border-[#d8d1c6] text-[#767676] hover:text-[#00635d] hover:border-[#00635d] shadow-sm transition-colors"
          title="Redigera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        {/* Ta bort-knapp */}
        <button
          onClick={handleDeleteClick}
          className="p-2 bg-white rounded-full border border-[#d8d1c6] text-[#767676] hover:text-red-600 hover:border-red-600 shadow-sm transition-colors"
          title="Ta bort"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-14v4M1 7h22" />
          </svg>
        </button>
      </div>

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
          <h3 className="font-['Georgia',_serif] font-bold text-[#382110] text-lg leading-tight group-hover:text-[#00635d] group-hover:underline transition-colors pr-16">
            {book.title}
          </h3>
          <p className="text-[#00635d] text-sm mt-0.5">{book.author}</p>
          
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={Math.round(book.avg_rating || 0)} />
            <span className="text-xs text-[#999]">· {book.page_count || 0} sidor</span>
          </div>

          {book.genre && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.genre.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[, ]+/).filter(Boolean).slice(0, 2).map((g, i) => (
                <span key={i} className="bg-[#f4f1ea] text-[#382110] text-[10px] font-bold px-2 py-1 rounded border border-[#d8d1c6]">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}