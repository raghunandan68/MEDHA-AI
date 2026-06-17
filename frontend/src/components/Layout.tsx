import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../lib/AuthContext";

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
          <div className="absolute inset-0 h-14 w-14 animate-spin-reverse rounded-full border-2 border-transparent border-r-purple-400" style={{ animationDuration: "4s" }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-300">Medha AI</p>
          <p className="text-sm text-slate-500 mt-0.5">Loading your experience...</p>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/auth/callback";

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
