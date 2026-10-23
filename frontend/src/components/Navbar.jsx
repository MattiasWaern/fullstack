import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

// Matchar Home.varB-bokryggar.jsx. Samma typsnitt (Bricolage Grotesque) och färger.
// Under md-brytpunkten (768px) döljs menyn bakom en hamburgerknapp.
const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]";

const SPINE_MARK = ['#D1495B', '#EDAE49', '#00798C'];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const username = localStorage.getItem("username");

  // Stäng menyn när man byter sida
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Stäng menyn med Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setOpen(false);
    navigate("/login");
  }

  // Mobil: svart stapel till vänster om aktiv länk. Desktop: understrykning.
  const linkClass = ({ isActive }) =>
    `text-base md:text-sm font-semibold py-2 md:py-1 pl-3 md:pl-0 border-l-4 md:border-l-0 md:border-b-2 transition-colors ${focusRing} ${
      isActive
        ? 'text-[#1B1B1F] border-[#1B1B1F]'
        : 'text-[#52525B] border-transparent hover:text-[#1B1B1F]'
    }`;

  return (
    <nav className={`bg-[#FAFAFA] border-b border-[#E4E4E7] sticky top-0 z-50 ${FONT}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-6">

        {/* Logga: tre små bokryggar */}
        <Link to="/" className={`flex items-center gap-2.5 rounded-sm ${focusRing}`} aria-label="MyReads, till startsidan">
          <span className="flex items-end gap-0.5" aria-hidden="true">
            {SPINE_MARK.map((bg, i) => (
              <span
                key={bg}
                style={{ background: bg, height: 16 + i * 4 }}
                className="w-1.5 rounded-t-[1px]"
              />
            ))}
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#1B1B1F]">
            MyReads
          </span>
        </Link>

        {/* Hamburgerknapp, bara på mobil */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Stäng menyn' : 'Öppna menyn'}
          className={`md:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-full hover:bg-[#F0F0F2] transition-colors ${focusRing}`}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1B1B1F" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <>
                <path d="M5 5 L17 17" />
                <path d="M17 5 L5 17" />
              </>
            ) : (
              <>
                <path d="M3 6 H19" />
                <path d="M3 11 H19" />
                <path d="M3 16 H19" />
              </>
            )}
          </svg>
        </button>

        {/* Menyn: staplad under loggan på mobil, på en rad från md */}
        <div
          id="nav-menu"
          className={`${open ? 'flex' : 'hidden'} md:flex w-full md:w-auto flex-col md:flex-row md:items-center gap-1 md:gap-6 pt-3 pb-2 md:py-0 mt-3 md:mt-0 border-t border-[#E4E4E7] md:border-t-0`}
        >
          <NavLink to="/" end className={linkClass}>Hem</NavLink>
          <NavLink to="/my-books" className={linkClass}>Mina böcker</NavLink>
          <NavLink to="/browse" className={linkClass}>Bläddra</NavLink>

          {username ? (
            <div className="flex items-center justify-between md:justify-start gap-3 mt-3 pt-4 md:mt-0 md:pt-0 border-t border-[#E4E4E7] md:border-t-0">
              <Link
                to="/profile"
                className={`flex items-center gap-2 rounded-full pr-3 text-sm font-semibold text-[#1B1B1F] hover:bg-[#F0F0F2] transition-colors ${focusRing}`}
              >
                <span className="w-8 h-8 rounded-full bg-[#1B1B1F] text-white flex items-center justify-center text-sm font-semibold">
                  {username[0]?.toUpperCase()}
                </span>
                {username}
              </Link>

              <button
                onClick={logout}
                className={`text-sm font-semibold text-[#52525B] hover:text-[#1B1B1F] px-4 py-2 md:py-1.5 rounded-full border border-[#D4D4D8] hover:border-[#1B1B1F] transition-colors ${focusRing}`}
              >
                Logga ut
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-3 pt-4 md:mt-0 md:pt-0 border-t border-[#E4E4E7] md:border-t-0">
              <Link
                to="/login"
                className={`flex-1 md:flex-none text-center text-sm font-semibold text-[#1B1B1F] px-4 py-2.5 md:py-1.5 rounded-full border border-[#D4D4D8] hover:border-[#1B1B1F] transition-colors ${focusRing}`}
              >
                Logga in
              </Link>
              <Link
                to="/register"
                className={`flex-1 md:flex-none text-center text-sm font-semibold bg-[#1B1B1F] text-white px-5 py-2.5 md:py-1.5 rounded-full hover:bg-[#3A3A42] transition-colors ${focusRing}`}
              >
                Skapa konto
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}