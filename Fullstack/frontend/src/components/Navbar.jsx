import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }

  return (
    <nav className="bg-[#f4f1ea] border-b border-[#d8d1c6] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">📚</span>
          <span className="font-['Georgia',_'Times_New_Roman',_serif'] text-2xl font-bold text-[#382110] group-hover:text-[#00635d] transition-colors">
            MyReads
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-[#382110] hover:text-[#00635d] transition-colors font-medium"
          >
            Hem
          </Link>

          <Link
            to="/my-books"
            className="text-sm text-[#382110] hover:text-[#00635d] transition-colors"
          >
            Mina böcker
          </Link>

          <Link
            to="/browse"
            className="text-sm text-[#382110] hover:text-[#00635d] transition-colors"
          >
            Bläddra
          </Link>

          {username ? (
            <>
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-[#382110] hover:text-[#00635d] transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#f4f1ea] rounded-full flex items-center justify-center text-[#382110] font-medium text-sm border border-[#d8d1c6] group-hover:border-[#b5a58c] transition-colors">
                    {username[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium">{username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="text-sm text-[#767676] hover:text-[#382110] transition-colors px-3 py-1.5 rounded-sm hover:bg-[#ede6d6]"
                >
                  Logga ut
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-[#382110] hover:text-[#00635d] transition-colors font-medium px-3 py-1.5"
              >
                Logga in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-[#409D69] text-white px-4 py-1.5 rounded-sm hover:bg-[#358558] transition-colors font-medium"
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
