import { useState } from "react";

export default function AddManualBook({ onSave, onCancel, initialTitle = "" }) {
  const [formData, setFormData] = useState({
    title: initialTitle,
    author: "",
    description: "",
    cover_url: "",
    genre: "",
    page_count: "",
    release_year: "",
    publisher: "",
    isbn: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#fdfcf9] p-6 rounded-lg border border-[#d8d1c6]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">Titel</label>
          <input required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">Författare</label>
          <input required className="w-full border p-2 rounded" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">ISBN</label>
          <input className="w-full border p-2 rounded" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">Genre</label>
          <input className="w-full border p-2 rounded" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">Antal Sidor</label>
          <input type="number" className="w-full border p-2 rounded" value={formData.page_count} onChange={e => setFormData({...formData, page_count: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-[#382110]">Utgivningsår</label>
          <input type="number" className="w-full border p-2 rounded" value={formData.release_year} onChange={e => setFormData({...formData, release_year: e.target.value})} />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-[#382110]">Omslags-URL</label>
        <input className="w-full border p-2 rounded" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-[#382110]">Beskrivning</label>
        <textarea className="w-full border p-2 rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="bg-[#409D69] text-white px-6 py-2 rounded font-medium hover:bg-[#358558]">Spara i databasen</button>
        <button type="button" onClick={onCancel} className="text-gray-500 px-4 py-2 hover:underline">Avbryt</button>
      </div>
    </form>
  );
}