import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import type { User } from "../types";

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

export default function ProtectedRoute() {
  const { loading } = useAuth();
  const ctx = useOutletContext<{ user: User | null }>();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!ctx.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={ctx} />;
}
