# MyReads

MyReads är en webbapplikation för att upptäcka, recensera och hålla koll på böcker. Användare kan söka efter böcker, skriva recensioner, skapa egna läslistor och följa sina läsframsteg.

Projektet är byggt med React i frontend och Express i backend. Applikationen använder även Open Library API för att hämta bokinformation.

## Funktioner

### Böcker
- Visa böcker som finns i biblioteket.
- Söka efter böcker baserat på titel eller författare.
- Hämta bokinformation från Open Library API.
- Lägga till böcker manuellt med titel, författare, genre, beskrivning och övrig information.
- Visa detaljerad information om varje bok.
- Redigera och ta bort böcker som man själv har lagt till.

### Recensioner
- Skriva recensioner och ge böcker betyg.
- Läsa recensioner från andra användare.
- Se en boks genomsnittliga betyg.
- Redigera och ta bort sina egna recensioner.

### Läslistor
- Spara böcker i en personlig *Want to Read*-lista.
- Se sparade böcker på startsidan och profilsidan.
- Markera böcker som påbörjade.
- Uppdatera vilken sida man befinner sig på.
- Följa läsframsteg med en procentbaserad indikator.

### Användare
- Registrera konto och logga in.
- Personlig profilsida med recensioner och läslista.
- Översikt över antal recensioner och genomsnittligt betyg.
- Autentisering med JSON Web Tokens (JWT).

## Tekniker

### Frontend
- React
- JavaScript
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- SQLite (better-sqlite3)
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- CORS

### Externt API
- [Open Library API](https://openlibrary.org/developers/api) – används för att söka efter böcker och hämta information som titel, författare, ISBN och bokomslag.

## Installation

För att köra projektet lokalt behöver du ha Node.js och npm installerat.

### 1. Klona projektet

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Installera beroenden

Öppna frontend- och backend-mapparna och installera respektive beroenden.

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Miljövariabler

Backend använder miljövariabler via `dotenv`. Skapa en `.env`-fil i backend-mappen och konfigurera de variabler som servern kräver, exempelvis en hemlig nyckel för JWT.

```env
JWT_SECRET=your_secret_key
PORT=3000
```

Anpassa variabelnamnen efter backend-konfigurationen.

### 4. Starta projektet

Starta backend:

```bash
cd backend
npm run dev
```

Starta frontend i en separat terminal:

```bash
cd frontend
npm run dev
```

Kommandona förutsätter att respektive `package.json` innehåller ett `dev`-script.

Öppna sedan adressen som visas i terminalen för frontend.

## Projektstruktur

Projektet är uppdelat i frontend och backend.

```text
frontend/
  src/
    components/
      AddManualBook.jsx
      BookCard.jsx
      BookSearch.jsx
      ReadingTracker.jsx
      StarRating.jsx
      WantToReadSidebar.jsx
    pages/
      Home.jsx
      BookDetail.jsx
      Profile.jsx
    api.js

backend/
  package.json
```

Strukturen ovan visar de centrala filer och komponenter som används i projektet.

## Hur applikationen fungerar

Frontend kommunicerar med backend via HTTP-anrop med Axios. Backend hanterar bokinformation, användare, recensioner och personliga läslistor.

När en användare söker efter en bok görs först en sökning i den lokala databasen. Därefter hämtas ytterligare resultat från Open Library API. Böcker som redan finns lokalt filtreras bort från de externa resultaten för att minska antalet dubbletter.

Inloggade användare kan skriva recensioner, spara böcker i sin läslista och registrera hur långt de har kommit i sin läsning.

Läsframstegen sparas i databasen och visas som en progressindikator baserat på aktuell sida och bokens totala sidantal.

## Design

Gränssnittet är byggt med Tailwind CSS och använder typsnittet Bricolage Grotesque.

Designen har en ljus bakgrund, mörk typografi och färgade detaljer inspirerade av bokryggar. Målet har varit att skapa ett enkelt och lättnavigerat gränssnitt där böckerna och deras innehåll står i fokus.

Layouten är responsiv och anpassad för både mobil och desktop.

## Vidareutveckling

Möjliga förbättringar framöver är:

- Utökad filtrering och sortering av böcker.
- Möjlighet att markera böcker som färdiglästa.
- Mer detaljerad statistik över läsvanor.
- Personliga bokrekommendationer.
- Möjlighet att skapa flera egna läslistor.

## Licens

Projektet är utvecklat i utbildnings- och portfoliosyfte.
