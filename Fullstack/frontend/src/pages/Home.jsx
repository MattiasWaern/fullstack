import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from '../api';

export default function Home(){
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const isLoggedIn = !!localStorage.getItem('token');
    
    useEffect(() => {api.get('/books').then(r => setBooks(r.data));}, []);

    async function addBook(e){
        e.preventDefault();
        const {data} = await api.post('/books', {title, author});
        setBooks([{...data, review_count: 0}, ...books]);
        setTitle(''); setAuthor('');
    }


    return (
       <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Alla böcker</h2>

      {isLoggedIn && (
        <form onSubmit={addBook} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
          <input placeholder="Författare" value={author} onChange={e => setAuthor(e.target.value)} required />
          <button type="submit">Lägg till bok</button>
        </form>
      )}

      {books.map(book => (
        <Link key={book.id} to={`/books/${book.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
            <strong>{book.title}</strong> - {book.author}
            <br />
            <small>{book.review_count} recensioner {book.avg_rating ? `. Snittbetyg: ${Number(book.avg_rating).toFixed(1)}` : ''}</small>
        </Link>
      ))}
      </div> 
    )
}