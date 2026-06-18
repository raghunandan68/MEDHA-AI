import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Document } from "../types";

// ── SVG Icon Components ──────────────────────────────────────────────────────

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 12 15 12 15 21" />
  </svg>
);









const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconAnalytics = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Brain SVG Logo ────────────────────────────────────────────────────────────

const BrainLogo = () => (
  <svg width="26" height="26" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M36 14C27.5 14 19 21 19 30.5C16.5 32.5 14.5 37 16.5 41.5C14.5 46 17 51.5 22 53.5C23.5 58.5 29.5 63 36 63" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M36 14C44.5 14 53 21 53 30.5C55.5 32.5 57.5 37 55.5 41.5C57.5 46 55 51.5 50 53.5C48.5 58.5 42.5 63 36 63" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <line x1="36" y1="16" x2="36" y2="61" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round"/>
    <path d="M28 30L22 35L28 40" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="16.5" y1="38" x2="22" y2="35" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="28" cy="30" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
    <path d="M44 30L50 35L44 40" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="55.5" y1="38" x2="50" y2="35" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="44" cy="30" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
    <circle cx="36" cy="14" r="2.5" fill="#6d28d9" stroke="#c4b5fd" strokeWidth="1"/>
  </svg>
);

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);

  useEffect(() => {
    api.get<{ documents: Document[] }>("/api/documents")
      .then((res) => setRecentDocs(res.documents.slice(0, 6)))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Home",          path: "/dashboard",  Icon: IconHome      },
    { label: "Chat",          path: "/chat",        Icon: IconChat      },
    { label: "Analytics",     path: "/analytics",  Icon: IconAnalytics },
    { label: "Quiz History",  path: "/history",    Icon: IconHistory   },
  ];

  const visibleDocs = showAllRecent ? recentDocs : recentDocs.slice(0, 4);

  return (
    <aside
      className="w-64 flex flex-col min-h-screen text-slate-300 border-r border-white/5"
      style={{ background: "linear-gradient(180deg, #0d0b1e 0%, #100d22 100%)" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.6))" }}>
            <BrainLogo />
          </div>
          <span className="text-[17px] font-bold text-white tracking-wide">Medha AI</span>
        </Link>
      </div>

      {/* ── New Chat Button ── */}
      <div className="px-3 mb-3">
        <Link
          to="/chat"
          className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
        >
          <IconPlus />
          New Chat
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="px-2 space-y-0.5 flex-shrink-0">
        {navItems.map(({ label, path, Icon }) => {
          const active = isActive(path) && (label === "Home" || path !== "/dashboard");
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className={active ? "text-violet-400" : "text-slate-500"}>
                <Icon />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Recent Documents ── */}
      {recentDocs.length > 0 && (
        <div className="px-3 mt-5 flex-shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-1 mb-2">
            Recent
          </p>
          <div className="space-y-0.5">
            {visibleDocs.map((doc) => (
              <Link
                key={doc.id}
                to={`/flashcards/${doc.id}`}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group"
              >
                <span className="text-slate-600 group-hover:text-slate-400 flex-shrink-0">
                  <IconFile />
                </span>
                <span className="text-[12.5px] font-medium truncate leading-tight">
                  {doc.filename}
                </span>
              </Link>
            ))}
          </div>

          {recentDocs.length > 4 && (
            <button
              onClick={() => setShowAllRecent(!showAllRecent)}
              className="flex items-center gap-1.5 px-2 py-1.5 mt-0.5 text-[11.5px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span
                className="transition-transform duration-200"
                style={{ transform: showAllRecent ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <IconChevronDown />
              </span>
              {showAllRecent ? "Show less" : "View all"}
            </button>
          )}
        </div>
      )}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom: Settings + Logout ── */}
      <div className="px-2 pb-4 border-t border-white/5 pt-3 space-y-0.5">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive("/settings")
              ? "bg-violet-600/20 text-violet-300 border border-violet-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <span className={isActive("/settings") ? "text-violet-400" : "text-slate-500"}>
            <IconSettings />
          </span>
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/6 transition-all duration-150 text-left"
        >
          <span className="text-slate-500">
            <IconLogout />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
