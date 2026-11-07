
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", close);

    return () => {
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }

  return (
    <nav className="bh-nav">
      <div className="bh-nav-inner">
        <Link to="/" className="bh-brand">
          <span aria-hidden="true">▤</span> MyReads
        </Link>

        <button
          className="bh-mobile-toggle"
          aria-label={open ? "Stäng menyn" : "Öppna menyn"}
          aria-expanded={open}
          aria-controls="bh-nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div
          id="bh-nav-menu"
          className={`bh-nav-links ${open ? "open" : ""}`}
        >
          <NavLink end to="/">
            Hem
          </NavLink>

          <a href="/#bibliotek">Utforska</a>

          <NavLink to="/profile">
            Mina böcker
          </NavLink>
        </div>

        <div className="bh-nav-account">
          {username ? (
            <>
              <Link to="/profile" className="bh-user">
                <span>{username[0]?.toUpperCase()}</span>
                {username}
              </Link>

              <button onClick={logout}>
                Logga ut
              </button>
            </>
          ) : (
            <Link to="/login" className="bh-login">
              Logga in ↗
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
