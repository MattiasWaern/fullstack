import { Link, NavLink, useNavigate } from "react-router-dom";

// Matchar Home.varB-bokryggar.jsx. Samma typsnitt (Bricolage Grotesque) och färger.
const FONT = "font-['Bricolage_Grotesque',system-ui,sans-serif]";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30638E]";

const SPINE_MARK = ['#D1495B', '#EDAE49', '#00798C'];

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }

  // Aktiv länk får en svart understrykning, övriga blir grå
  const linkClass = ({ isActive }) =>
    `text-sm font-semibold py-1 border-b-2 transition-colors ${focusRing} ${
      isActive
        ? 'text-[#1B1B1F] border-[#1B1B1F]'
        : 'text-[#52525B] border-transparent hover:text-[#1B1B1F]'
    }`;

  return (
    <nav className={`bg-[#FAFAFA] border-b border-[#E4E4E7] sticky top-0 z-50 ${FONT}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">

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

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" end className={linkClass}>Hem</NavLink>
          <NavLink to="/my-books" className={linkClass}>Mina böcker</NavLink>
          <NavLink to="/browse" className={linkClass}>Bläddra</NavLink>

          {username ? (
            <div className="flex items-center gap-3">
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
                className={`text-sm font-semibold text-[#52525B] hover:text-[#1B1B1F] px-4 py-1.5 rounded-full border border-[#D4D4D8] hover:border-[#1B1B1F] transition-colors ${focusRing}`}
              >
                Logga ut
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`text-sm font-semibold text-[#1B1B1F] px-4 py-1.5 rounded-full border border-[#D4D4D8] hover:border-[#1B1B1F] transition-colors ${focusRing}`}
              >
                Logga in
              </Link>
              <Link
                to="/register"
                className={`text-sm font-semibold bg-[#1B1B1F] text-white px-5 py-1.5 rounded-full hover:bg-[#3A3A42] transition-colors ${focusRing}`}
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