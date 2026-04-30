import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from('../api');

export default function BookDetail (){
    const {id} = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(3);
    const [text, setText] = useState('');
    const isLoggedIn = !! localStorage.getItem('token');

    useEffect(() => {
        api.get(`/books/${id}`).then(r => setBook(r.data));
        api.get(`/books/${id}/reviews`).then(r => setReviews(r.data));
    }, [id]);


    async function submitReview(e){
        e.preventDefault();
        const {data} = await api.post('/reviews', {book_id: id, rating, text});
        setReviews([{...data, username: localStorage.getItem('username') }, ...reviews]);
        setText(''); setRating(3);
    }

    if(!book) return <p>Laddar...</p>
}
return (
    <div style={{}}>
        <h2>{book.title}</h2>
        <p>{book.author}</p>
        {book.description && <p>{book.description}</p>}

        <h3>Recensioner</h3>

        {isLoggedIn}(
            
        )
    </div>
)