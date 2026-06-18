import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';

export default function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // login eller register
    const [error, setError] = useState('');
    const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/auth/${mode}`, { username, password });
      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/');
      } else {
        setMode('login');
        setError('Konto skapat! Logga in nu.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Något gick fel');
    }
  }

    return (
    <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-[#382110] mb-6 text-center">
          {mode === 'login' ? 'Logga in' : 'Skapa konto'}
        </h2>

        {error && <p className="text-sm mb-4 text-center" style={{ color: error.includes('skapat') ? 'green' : 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Användarnamn"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#382110]"
          />
          <button type="submit" className="bg-[#382110] text-white py-2 rounded hover:bg-[#4a2f1a] font-medium">
            {mode === 'login' ? 'Logga in' : 'Registrera'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? 'Inget konto? ' : 'Redan konto? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[#382110] font-medium hover:underline"
          >
            {mode === 'login' ? 'Skapa ett' : 'Logga in'}
          </button>
        </p>
      </div>
    </div>
  );
}