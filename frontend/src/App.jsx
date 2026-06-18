import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import Home from './pages/Home'; 
import BookDetail from './pages/BookDetail'; 
import Login from './pages/Login'; 
import './index.css'
import Navbar from './components/Navbar';
import Profile from './pages/Profile';




export default function App () {

  return(
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />)