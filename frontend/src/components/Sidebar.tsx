import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { label: "Home", path: "/dashboard", icon: "🏠" },
    { label: "Chat", path: "/chat", icon: "💬" },
    { label: "Analytics", path: "/analytics", icon: "📊" },
    { label: "Quiz History", path: "/history", icon: "📝" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-medha-sidebar flex flex-col min-h-screen text-slate-300 p-4 border-r border-white/5">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <span className="text-lg font-bold text-white tracking-wide">Medha AI</span>
        </Link>
      </div>

      <Link
        to="/chat"
        className="flex items-center justify-center gap-2 w-full bg-medha-button text-white rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 mb-6"
      >
        <span>+</span> New Chat
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 pt-4 space-y-1">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            location.pathname === "/settings"
              ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>⚙️</span>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
