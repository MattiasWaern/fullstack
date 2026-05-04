import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import Home from './pages/Home'; 
import BookDetail from './pages/BookDetail'; 
import Login from './pages/Login'; 
import { Book } from 'lucide-react';



function Nav (){
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  }
  return(
    <>
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link to="/">Böcker</Link>
      {username ? (
        <>
        <span>Inloggad som {username} </span>
        <button onClick={logout}>Logga ut</button>
        </>
      ) : (
        <Link to="/login">Logga in</Link>
      )}
    </nav>
    </>
  );
}



export default function App () {

  return(
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />)