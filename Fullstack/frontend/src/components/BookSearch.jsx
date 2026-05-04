import { useState } from "react";

export default function BookSearch({onSelect}){
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] =(false);

    async function search(){
        if(!query.trim()) return;
        setLoading(true);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`);
        const data = await res.json();
        setResults(data.items || []);
        setLoading(false);
    }

    
}
