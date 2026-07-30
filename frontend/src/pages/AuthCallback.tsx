import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setToken } from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleSession = async () => {
      const oauthError = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (oauthError) {
        setError(errorDescription || "GitHub sign-in was cancelled or failed. Please try again.");
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError("Failed to complete sign-in. Please try again.");
        return;
      }
      if (session) {
        setToken(session.access_token);
        const user = session.user;
        const userData = {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.user_metadata?.user_name ?? user.email?.split("@")[0] ?? "User",
          created_at: user.created_at,
        };
        localStorage.setItem("medha_user", JSON.stringify(userData));
        window.location.href = "/dashboard";
      } else {
        setError("No session found. Please try signing in again.");
      }
    };
    handleSession();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-medha-button text-white rounded-xl px-6 py-3 text-sm font-bold hover:opacity-95 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <svg className="h-8 w-8 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}
