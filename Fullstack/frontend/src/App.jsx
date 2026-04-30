import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from ('./pages/Home'); 
import BookDetail from ('./pages/BookDetail'); 
import Login from ('./pages/Login'); 


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
    
    </>
  )
}



export default function App () {

}
