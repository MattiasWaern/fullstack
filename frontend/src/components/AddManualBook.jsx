
import { useState } from "react";
import "../styles/BookForms.css";

const initialData = {
  title: "",
  author: "",
  genre: "",
  isbn: "",
  page_count: "",
  release_year: "",
  publisher: "",
  cover_url: "",
  description: "",
};

export default function AddManualBook({
  onSave,
  onCancel,
  initialTitle = "",
  saving = false,
}) {
  const [formData, setFormData] = useState({
    ...initialData,
    title: initialTitle,
  });

  const [imageError, setImageError] = useState(false);

  function updateField(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const title = formData.title.trim();
    const author = formData.author.trim();

    if (!title || !author) return;

    onSave({
      ...formData,
      title,
      author,
      genre: formData.genre.trim(),
      isbn: formData.isbn.trim(),
      publisher: formData.publisher.trim(),
      description: formData.description.trim(),
      cover_url: formData.cover_url.trim(),
      page_count: formData.page_count
        ? Number(formData.page_count)
        : null,
      release_year: formData.release_year
        ? Number(formData.release_year)
        : null,
    });
  }

  return (
    <form className="bf-manual" onSubmit={handleSubmit}>
      <div className="bf-manual-heading">
        <span className="bf-eyebrow">DITT BIBLIOTEK</span>
        <h2>En ny bok till hyllan.</h2>
        <p>
          Fyll i det du vet om boken. Titel och författare
          är obligatoriska, resten kan du komplettera senare.
        </p>
      </div>

      <div className="bf-manual-content">
        <section className="bf-form-section">
          <div className="bf-section-title">
            <h3>Om boken</h3>
            <p>Grundläggande information</p>
          </div>

          <div className="bf-form-grid">
            <div className="bf-field">
              <label htmlFor="manual-title">
                Titel <span>*</span>
              </label>
              <input
                id="manual-title"
                required
                value={formData.title}
                placeholder="Bokens titel"
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
              />
            </div>

            <div className="bf-field">
              <label htmlFor="manual-author">
                Författare <span>*</span>
              </label>
              <input
                id="manual-author"
                required
                value={formData.author}
                placeholder="Författarens namn"
                onChange={(e) =>
                  updateField("author", e.target.value)
                }
              />
            </div>

            <div className="bf-field">
              <label htmlFor="manual-genre">Genre</label>
              <input
                id="manual-genre"
                value={formData.genre}
                placeholder="Exempelvis fantasy eller roman"
                onChange={(e) =>
                  updateField("genre", e.target.value)
                }
              />
            </div>

            <div className="bf-field">
              <label htmlFor="manual-isbn">ISBN</label>
              <input
                id="manual-isbn"
                value={formData.isbn}
                placeholder="ISBN-nummer"
                onChange={(e) =>
                  updateField("isbn", e.target.value)
                }
              />
            </div>
          </div>
        </section>

        <section className="bf-form-section">
          <div className="bf-section-title">
            <h3>Utgivning</h3>
            <p>Lite mer om bokens utgåva</p>
          </div>

          <div className="bf-form-grid three">
            <div className="bf-field">
              <label htmlFor="manual-pages">Antal sidor</label>
              <input
                id="manual-pages"
                type="number"
                min="1"
                step="1"
                value={formData.page_count}
                placeholder="320"
                onChange={(e) =>
                  updateField("page_count", e.target.value)
                }
              />
            </div>

            <div className="bf-field">
              <label htmlFor="manual-year">Utgivningsår</label>
              <input
                id="manual-year"
                type="number"
                min="0"
                max="2100"
                step="1"
                value={formData.release_year}
                placeholder="2024"
                onChange={(e) =>
                  updateField("release_year", e.target.value)
                }
              />
            </div>

            <div className="bf-field">
              <label htmlFor="manual-publisher">Förlag</label>
              <input
                id="manual-publisher"
                value={formData.publisher}
                placeholder="Förlagets namn"
                onChange={(e) =>
                  updateField("publisher", e.target.value)
                }
              />
            </div>
          </div>
        </section>

        <section className="bf-form-section">
          <div className="bf-section-title">
            <h3>Bokomslag</h3>
            <p>Ge boken en plats på din digitala bokhylla</p>
          </div>

          <div className="bf-cover-section">
            <div className="bf-cover-preview">
              {formData.cover_url.trim() && !imageError ? (
                <img
                  src={formData.cover_url}
                  alt="Förhandsvisning av bokomslag"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="bf-cover-fallback">
                  <strong>
                    {formData.title || "Din boktitel"}
                  </strong>
                  <span>
                    {formData.author || "Författare"}
                  </span>
                </div>
              )}
            </div>

            <div className="bf-field">
              <label htmlFor="manual-cover">
                Länk till bokomslag
              </label>
              <input
                id="manual-cover"
                type="url"
                value={formData.cover_url}
                placeholder="https://example.com/omslag.jpg"
                onChange={(e) => {
                  updateField("cover_url", e.target.value);
                  setImageError(false);
                }}
              />
              <p className="bf-field-help">
                Klistra in en bildlänk. Förhandsvisningen
                uppdateras automatiskt.
              </p>
            </div>
          </div>
        </section>

        <section className="bf-form-section">
          <div className="bf-section-title">
            <h3>Beskrivning</h3>
            <p>Vad handlar boken om?</p>
          </div>

          <div className="bf-field">
            <label htmlFor="manual-description">
              Bokens beskrivning
            </label>
            <textarea
              id="manual-description"
              rows={5}
              value={formData.description}
              placeholder="Skriv en kort beskrivning..."
              onChange={(e) =>
                updateField("description", e.target.value)
              }
            />
          </div>
        </section>
      </div>

      <div className="bf-manual-footer">
        <button
          type="button"
          className="bf-outline"
          onClick={onCancel}
          disabled={saving}
        >
          Avbryt
        </button>

        <button
          type="submit"
          className="bf-primary"
          disabled={saving}
        >
          {saving ? "Sparar..." : "+ Lägg till i biblioteket"}
        </button>
      </div>
    </form>
  );
}
