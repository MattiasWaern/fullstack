import { useEffect, useState } from "react";
import  {useNavigate, Link} from 'react-router-dom';
import api from '../api';
import StarRating from "../components/StarRating";


export default function Profile(){
    const [reviews, setReviews] = useState([]);
    const username =localStorage.getItem('username');
    const navigate = useNavigate();

    useEffect(() => {
        if(!username) {navigate('/login'); return;}
        api.get('/reviews/mine').then(reviews => setReviews(r.data));

    }, []);

    return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-[#382110] text-white rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#382110] text-2xl font-bold">
          {username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{username}</h1>
          <p className="text-[#e8d5b7] text-sm">{reviews.length} recensioner</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[#382110] mb-4">Mina recensioner</h2>

      {reviews.length === 0 && <p className="text-gray-400">Du har inte skrivit några recensioner än.</p>}
      <div className="flex flex-col gap-3">
        {reviews.map(r => (
          <Link to={`/books/${r.book_id}`} key={r.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="font-semibold text-[#382110]">{r.book_title}</p>
            <StarRating rating={r.rating} />
            <p className="text-gray-600 text-sm mt-1">{r.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}