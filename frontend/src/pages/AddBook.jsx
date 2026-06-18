import { useState } from 'react';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '', author: '', description: '', cover_url: '',
    genre: '', page_count: '', release_year: '', publisher: '', isbn: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Boken har lagts till!');
        // Rensa formuläret
        setFormData({ title: '', author: '', description: '', cover_url: '',
          genre: '', page_count: '', release_year: '', publisher: '', isbn: '' });
      }
    } catch (err) {
      console.error("Fel vid sparande:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Lägg till ny bok</h2>
      <input name="title" placeholder="Titel" onChange={handleChange} required />
      <input name="author" placeholder="Författare" onChange={handleChange} required />
      <textarea name="description" placeholder="Beskrivning" onChange={handleChange} />
      <input name="isbn" placeholder="ISBN" onChange={handleChange} />
      <input name="cover_url" placeholder="Bild-URL (omslag)" onChange={handleChange} />
      <input name="genre" placeholder="Genre" onChange={handleChange} />
      <input type="number" name="page_count" placeholder="Antal sidor" onChange={handleChange} />
      <input type="number" name="release_year" placeholder="Utgivningsår" onChange={handleChange} />
      <input name="publisher" placeholder="Förlag" onChange={handleChange} />
      
      <button type="submit">Spara bok</button>
    </form>
  );
};

export default AddBook;