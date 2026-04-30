import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';

export default function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // login eller register
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e){

        e.preventDefault();
        setError('');

        try{
            const {data} = await api.post(`/auth${mode}`, {username, password});
            if (mode === 'login'){
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                navigate('/');
            } else {
                setMode('login');
                setError('Konto skapat, Logga in nu');
            }
        } catch (err){
            setError(err.response?.data?.error || 'Något gick fel xd');
        }
    }

    return (
        <div style={{maxWidth: 360, margin: '4rem auto', padding: '0 1rem'}}>
            <h2>{mode === 'login' ? 'Logga in' : 'Skapa konto'}</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <input placeholder="Användarnamn" value={username} onChange={e => setUsername(e.target.value)}></input>
                <input type="password" placeholder="Lösenord" value={password} onChange={e => setPassword (e.target.value)}></input>
                <button type="submit">{mode === 'login' ? 'Logga in' : 'Registrera'}</button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                {mode === 'login' ? 'Inget konto? ' : 'Redan konto? '}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue' }}>
                {mode === 'login' ? 'Skapa ett' : 'Logga in'}
                </button>
            </p>
        </div>
    );
}