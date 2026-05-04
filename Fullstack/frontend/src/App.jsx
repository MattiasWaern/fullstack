import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import Home from './pages/Home'; 
import BookDetail from './pages/BookDetail'; 
import Login from './pages/Login'; 
import { Book } from 'lucide-react';
import './index.css'
import Navbar from './components/Navbar';




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