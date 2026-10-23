
import { useState } from "react";

const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const inputClass =
  "w-full rounded-xl border border-[#D4D4D8] bg-white px-4 py-3 text-sm text-[#1B1B1F] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#30638E] focus:ring-2 focus:ring-[#30638E]/20";

const labelClass =
  "mb-2 block text-xs font-bold text-[#52525B]";

export default function AddManualBook({
  onSave,
  onCancel,
  initialTitle = "",
}) {
  const [formData, setFormData] = useState({
    title: initialTitle,
    author: "",
    description: "",
    cover_url: "",
    genre: "",
    page_count: "",
    release_year: "",
    publisher: "",
    isbn: "",
  });

  const [imageError, setImageError] = useState(false);

  function updateField(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...formData,
      title: formData.title.trim(),
      author: formData.author.trim(),
      page_count: formData.page_count
        ? Number(formData.page_count)
        : null,
      release_year: formData.release_year
        ? Number(formData.release_year)
        : null,
    });
  }

  const showCover = formData.cover_url.trim() && !imageError;

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white ${FONT}`}
    >
      {/* HEADER */}
      <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] px-6 py-6 sm:px-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#00798C]">
          Lägg till manuellt
        </p>

        <h2 className="text-2xl font-extrabold tracking-tight text-[#1B1B1F] sm:text-3xl">
          En ny bok till hyllan.
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#71717A]">
          Fyll i informationen om din bok. Titel och författare
          är obligatoriska, resten kan du komplettera senare.
        </p>
      </div>

      <div className="space-y-8 p-6 sm:p-8">

        {/* GRUNDINFORMATION */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1B1F] text-xs font-bold text-white">
              01
            </span>

            <h3 className="text-lg font-extrabold tracking-tight text-[#1B1B1F]">
              Grundinformation
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="manual-title" className={labelClass}>
                Titel <span className="text-[#D1495B]">*</span>
              </label>
              <input
                id="manual-title"
                required
                placeholder="T.ex. The Great Gatsby"
                value={formData.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="manual-author" className={labelClass}>
                Författare <span className="text-[#D1495B]">*</span>
              </label>
              <input
                id="manual-author"
                required
                placeholder="T.ex. F. Scott Fitzgerald"
                value={formData.author}
                onChange={(e) =>
                  updateField("author", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="manual-genre" className={labelClass}>
                Genre
              </label>
              <input
                id="manual-genre"
                placeholder="T.ex. Roman, Klassiker"
                value={formData.genre}
                onChange={(e) =>
                  updateField("genre", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="manual-isbn" className={labelClass}>
                ISBN
              </label>
              <input
                id="manual-isbn"
                placeholder="978..."
                value={formData.isbn}
                onChange={(e) =>
                  updateField("isbn", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-[#E4E4E7]" />

        {/* UTGIVNINGSINFORMATION */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30638E] text-xs font-bold text-white">
              02
            </span>

            <h3 className="text-lg font-extrabold tracking-tight text-[#1B1B1F]">
              Utgivningsinformation
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="manual-pages" className={labelClass}>
                Antal sidor
              </label>
              <input
                id="manual-pages"
                type="number"
                min="1"
                placeholder="T.ex. 320"
                value={formData.page_count}
                onChange={(e) =>
                  updateField("page_count", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="manual-year" className={labelClass}>
                Utgivningsår
              </label>
              <input
                id="manual-year"
                type="number"
                min="0"
                max="2100"
                placeholder="T.ex. 2024"
                value={formData.release_year}
                onChange={(e) =>
                  updateField("release_year", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="manual-publisher" className={labelClass}>
                Förlag
              </label>
              <input
                id="manual-publisher"
                placeholder="T.ex. Penguin Books"
                value={formData.publisher}
                onChange={(e) =>
                  updateField("publisher", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-[#E4E4E7]" />

        {/* OMSLAG */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00798C] text-xs font-bold text-white">
              03
            </span>

            <h3 className="text-lg font-extrabold tracking-tight text-[#1B1B1F]">
              Bokomslag
            </h3>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row">
            {/* FÖRHANDSVISNING */}
            <div className="w-32 shrink-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-[#E4E4E7] bg-[#30638E] shadow-sm">
                <div className="absolute bottom-0 left-0 top-0 z-10 w-2 bg-[#1B1B1F]/20" />

                {showCover ? (
                  <img
                    src={formData.cover_url}
                    alt="Förhandsvisning av bokomslag"
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-3 text-center text-white">
                    <span className="mb-3 text-2xl">📖</span>
                    <p className="line-clamp-4 text-xs font-extrabold">
                      {formData.title || "Din boktitel"}
                    </p>
                    <p className="mt-2 text-[10px] text-white/70">
                      {formData.author || "Författare"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="manual-cover" className={labelClass}>
                URL till bokomslag
              </label>

              <input
                id="manual-cover"
                type="url"
                placeholder="https://example.com/book-cover.jpg"
                value={formData.cover_url}
                onChange={(e) => {
                  updateField("cover_url", e.target.value);
                  setImageError(false);
                }}
                className={inputClass}
              />

              <p className="mt-3 text-xs leading-relaxed text-[#71717A]">
                Klistra in en bildlänk för att visa bokens omslag.
                Förhandsvisningen uppdateras automatiskt.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#E4E4E7]" />

        {/* BESKRIVNING */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#66A182] text-xs font-bold text-[#10231A]">
              04
            </span>

            <h3 className="text-lg font-extrabold tracking-tight text-[#1B1B1F]">
              Beskrivning
            </h3>
          </div>

          <label htmlFor="manual-description" className={labelClass}>
            Vad handlar boken om?
          </label>

          <textarea
            id="manual-description"
            rows={5}
            placeholder="Skriv en kort beskrivning av boken..."
            value={formData.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
            className={`${inputClass} min-h-32 resize-y leading-relaxed`}
          />
        </section>
      </div>

      {/* FOOTER / KNAPPAR */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#E4E4E7] bg-[#FAFAFA] px-6 py-5 sm:flex-row sm:items-center sm:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[#D4D4D8] bg-white px-6 py-3 text-sm font-semibold text-[#52525B] transition-colors hover:border-[#1B1B1F] hover:text-[#1B1B1F]"
        >
          Avbryt
        </button>

        <button
          type="submit"
          className="rounded-full bg-[#1B1B1F] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3A3A42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]"
        >
          + Lägg till i biblioteket
        </button>
      </div>

      {/* FÄRGAD BOKHYLLA */}
      <div className="flex h-1.5">
        {[
          "#D1495B",
          "#EDAE49",
          "#00798C",
          "#30638E",
          "#66A182",
          "#1B1B1F",
        ].map((color) => (
          <div
            key={color}
            className="flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </form>
  );
}
