
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const isLogin = mode === "login";

  function changeMode() {
    setMode(isLogin ? "register" : "login");
    setError("");
    setSuccess("");
    setPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError("Fyll i både användarnamn och lösenord.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(`/auth/${mode}`, {
        username: username.trim(),
        password,
      });

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        navigate("/");
      } else {
        setMode("login");
        setPassword("");
        setSuccess("Ditt konto är skapat! Du kan nu logga in.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Något gick fel. Försök igen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bh-auth">
      <section className="bh-auth-editorial">
        <Link to="/" className="bh-auth-logo">
          <span className="bh-auth-logo-icon">▤</span>
          MyReads
        </Link>

        <div className="bh-auth-editorial-content">
          <span className="bh-auth-overline">
            ETT HEM FÖR ALLA DINA BERÄTTELSER
          </span>

          <h1>
            Mellan varje
            <br />
            <em>sida</em> finns
            <br />
            en ny värld.
          </h1>

          <p>
            Samla böckerna du älskar, upptäck nya favoriter
            och låt din läsresa fortsätta.
          </p>

          <div className="bh-auth-books" aria-hidden="true">
            <div className="bh-auth-book book-one">
              <span>STORIES</span>
            </div>
            <div className="bh-auth-book book-two">
              <span>CHAPTERS</span>
            </div>
            <div className="bh-auth-book book-three">
              <span>MYREADS</span>
            </div>
            <div className="bh-auth-book book-four">
              <span>BOOKS</span>
            </div>
          </div>
        </div>

        <div className="bh-auth-editorial-footer">
          <span>MYREADS</span>
          <span>Din personliga bokvärld</span>
        </div>
      </section>

      <section className="bh-auth-form-section">
        <div className="bh-auth-form-container">
          <Link to="/" className="bh-auth-back">
            ← Tillbaka till startsidan
          </Link>

          <div className="bh-auth-heading">
            <span className="bh-auth-eyebrow">
              {isLogin ? "VÄLKOMMEN TILLBAKA" : "BÖRJA DIN LÄSRESA"}
            </span>

            <h2>
              {isLogin ? "Välkommen tillbaka." : "Skapa ditt konto."}
            </h2>

            <p>
              {isLogin
                ? "Logga in för att fortsätta där du slutade."
                : "Skapa ett konto och börja samla dina läsupplevelser."}
            </p>
          </div>

          {error && (
            <div className="bh-auth-alert error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="bh-auth-alert success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bh-auth-form">
            <div className="bh-auth-field">
              <label htmlFor="auth-username">
                Användarnamn
              </label>

              <input
                id="auth-username"
                type="text"
                placeholder="Ditt användarnamn"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                minLength={2}
              />
            </div>

            <div className="bh-auth-field">
              <label htmlFor="auth-password">
                Lösenord
              </label>

              <div className="bh-auth-password">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ditt lösenord"
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Dölj lösenord"
                      : "Visa lösenord"
                  }
                >
                  {showPassword ? "Dölj" : "Visa"}
                </button>
              </div>
            </div>

            <button
              className="bh-auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Vänta..."
                : isLogin
                  ? "Logga in"
                  : "Skapa konto"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <div className="bh-auth-switch">
            <p>
              {isLogin
                ? "Har du inget konto ännu?"
                : "Har du redan ett konto?"}
            </p>

            <button type="button" onClick={changeMode}>
              {isLogin ? "Skapa ett konto" : "Logga in istället"}
            </button>
          </div>

          <div className="bh-auth-bottom">
            <span>En bok i taget, en berättelse i taget.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
