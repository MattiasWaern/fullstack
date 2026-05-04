import { use } from 'react';
import {Link, useNavigate } from 'react-router-dom';

export default function Navbar(){
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  }

  return (
    <nav className="bg-[#3821110] text-[#f4f1ea] px-6 py-3 flex items-center justify-between shadow-md">
        <Link to="/" className="text-2xl font-bold tracking-wide text-[#f4f1ea] hover:text-[#e8d5b7]">
        MyReads
        </Link>

        <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-[#e8d5b7]">Hem</Link>
            {username ? (
            <>
                <Link to="/profile" className="hover:text-[#e8d5b7]">👤 {username}</Link>
                <button onClick={logout} className="bg-[#f4f1ea] text-[#382110] px-3 py-1 rounded hover:bg-[#e8d5b7] font-medium">
                Logga ut
                </button>
            </>
            ) : (
            <Link to="/login" className="bg-[#f4f1ea] text-[#382110] px-3 py-1 rounded hover:bg-[#e8d5b7] font-medium">
                Logga in
            </Link>
            )}
        </div>
    </nav> 
  )
}