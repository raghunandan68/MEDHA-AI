import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useState } from "react";
import type { User } from "../types";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/auth/callback";

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/");
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isHome ? "bg-transparent" : "glass-nav"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={!isHome && !isAuthPage && user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
                M
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                Medha AI
              </span>
            </Link>
            {user && !isHome && !isAuthPage && (
              <div className="hidden items-center gap-0.5 md:flex">
                <NavLink to="/dashboard" label="Dashboard" />
                <NavLink to="/chat" label="Chat" />
                <NavLink to="/analytics" label="Analytics" />
                <NavLink to="/history" label="History" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && !isHome && !isAuthPage ? (
              <>
                <span className="hidden sm:block text-sm text-slate-400">
                  {user.name || user.email}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-premium rounded-lg px-4 py-1.5 text-sm shadow-lg shadow-indigo-500/15"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {user && !isHome && !isAuthPage && (
          <div className="flex gap-1 border-t border-white/5 py-1.5 md:hidden overflow-x-auto">
            <MobileNavLink to="/dashboard" label="Dashboard" />
            <MobileNavLink to="/chat" label="Chat" />
            <MobileNavLink to="/analytics" label="Analytics" />
            <MobileNavLink to="/history" label="History" />
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-medha-card border border-violet-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "text-indigo-300 bg-indigo-500/10"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
        isActive ? "text-indigo-300 bg-indigo-500/10" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}
