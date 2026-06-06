import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ReadingTracker() {
  const [readingList, setReadingList] = useState([]);
  const [updatePages, setUpdatePages] = useState({}); 
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchProgress = () => {
    if (isLoggedIn) {
      api.get("/books/my/reading-progress")
        .then((r) => setReadingList(r.data))
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [isLoggedIn]);

  const handlePageUpdate = async (bookId) => {
    const newPage = Number(updatePages[bookId]);
    if (isNaN(newPage) || newPage < 0) return alert("Ange ett giltigt sidnummer");

    try {
      await api.post(`/books/${bookId}/progress`, { current_page: newPage });
      alert("Sidan uppdaterad!");
      fetchProgress(); 
    } catch (err) {
      alert(err.response?.data?.error || "Kunde inte uppdatera");
    }
  };

  if (!isLoggedIn || readingList.length === 0) return null;

  return (
    <div className="bg-[#fdfbf7] rounded-lg border border-[#d8d1c6] p-6 shadow-sm mb-8">
      <h2 className="font-['Georgia',_serif] text-xl font-bold text-[#382110] mb-4">
        📖 Just nu läser jag
      </h2>
      <div className="grid gap-6">
        {readingList.map((item) => {
          // Räkna ut procenten dynamiskt
          const totalPages = item.page_count || 100; // fallback om boken saknar sidantal
          const percentage = Math.min(
            Math.round((item.current_page / totalPages) * 100),
            100
          );

          return (
            <div key={item.book_id} className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 border border-[#e8e4d9] rounded">
              <Link to={`/books/${item.book_id}`} className="w-16 h-24 flex-shrink-0">
                <img
                  src={item.cover_url || "https://via.placeholder.com/64x96?text=Bok"}
                  alt={item.title}
                  className="w-full h-full object-cover rounded shadow-sm"
                />
              </Link>

              <div className="flex-1 w-full">
                <Link to={`/books/${item.book_id}`} className="font-bold text-[#382110] hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500 italic mb-2">av {item.author}</p>

                
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Sida {item.current_page} av {item.page_count || "?"}</span>
                  <span className="text-[#409D69]">{percentage}% klart</span>
                </div>

                
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-[#409D69] h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              
              <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                <input
                  type="number"
                  placeholder="Ny sida"
                  value={updatePages[item.book_id] || ""}
                  onChange={(e) =>
                    setUpdatePages({ ...updatePages, [item.book_id]: e.target.value })
                  }
                  className="w-20 border border-[#d8d1c6] p-1.5 text-xs rounded bg-white text-center outline-none focus:ring-1 focus:ring-[#409D69]"
                />
                <button
                  onClick={() => handlePageUpdate(item.book_id)}
                  className="bg-[#382110] text-white px-3 py-1.5 text-xs font-bold rounded hover:bg-[#4a2f1a]"
                >
                  Uppdatera
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}