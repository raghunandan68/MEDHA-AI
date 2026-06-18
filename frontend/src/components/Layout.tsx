import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../lib/AuthContext";

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)]" />
      <div className="absolute inset-0">
        <div className="aurora-line" />
        <div className="aurora-line animate-pulse-glow" style={{ animationDelay: "2s", animationDuration: "8s" }} />
      </div>
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700" />
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
            <div className="absolute inset-0 h-20 w-20 animate-spin-reverse rounded-full border-4 border-transparent border-r-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]" style={{ animationDuration: "4s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-pulse-glow rounded-full bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl font-bold text-gradient">Medha AI</p>
            <div className="animate-bounce-gentle">✨</div>
          </div>
          <p className="text-sm text-slate-400 mt-1 animate-pulse-soft">Loading your intelligent experience...</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse-soft" style={{ animationDelay: "0s" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse-soft" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/auth/callback" || location.pathname === "/forgot-password";

  if (loading) return <LoadingScreen />;

  if (isHome || isAuthPage) {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <Navbar user={user} />
        <main className="relative">
          <Outlet context={{ user }} />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-medha-dark flex">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0b071e]/95 to-slate-950" />
      </div>

      <div className="relative z-10 flex w-full">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto px-8 py-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
