import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);

  const validateEmail = (email: string) => {
    return email && email.includes("@");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Enter valid email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          new_password: "temp",
          confirm_password: "temp",
        }),
      });

      if (response.status === 404) {
        setError("Invalid email please register first");
        setLoading(false);
        return;
      }

      setStep(2);
      setLoading(false);
    } catch (error) {
      setError("Invalid email please register first");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const err = await forgotPassword(email, newPassword, confirmPassword);
    if (err) {
      setError(err);
    } else {
      setSuccess("Password has been reset successfully! Please login with your new password.");
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden"
           style={{background: 'linear-gradient(180deg, #06030f 0%, #0e0624 55%, #06030f 100%)'}}>

        {/* Ambient purple glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full"
               style={{background: 'radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 65%)'}} />
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[420px] h-[280px] rounded-full"
               style={{background: 'radial-gradient(ellipse, rgba(139,92,246,0.30) 0%, transparent 70%)'}} />
        </div>

        {/* ── Top: logo + text ── */}
        <div className="relative z-10 flex flex-col items-center text-center pt-20 px-10 space-y-5">

          {/* Brain SVG Icon */}
          <div style={{filter: 'drop-shadow(0 0 18px rgba(139,92,246,0.55))'}}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36 14C27.5 14 19 21 19 30.5C16.5 32.5 14.5 37 16.5 41.5C14.5 46 17 51.5 22 53.5C23.5 58.5 29.5 63 36 63" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M36 14C44.5 14 53 21 53 30.5C55.5 32.5 57.5 37 55.5 41.5C57.5 46 55 51.5 50 53.5C48.5 58.5 42.5 63 36 63" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <line x1="36" y1="16" x2="36" y2="61" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round"/>
              <path d="M28 30L22 35L28 40" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="16.5" y1="38" x2="22" y2="35" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="22" y1="43" x2="17" y2="47" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="28" cy="30" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
              <circle cx="22" cy="43" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
              <path d="M44 30L50 35L44 40" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="55.5" y1="38" x2="50" y2="35" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="50" y1="43" x2="55" y2="47" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="44" cy="30" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
              <circle cx="50" cy="43" r="2.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1"/>
              <circle cx="36" cy="14" r="2.5" fill="#6d28d9" stroke="#c4b5fd" strokeWidth="1"/>
            </svg>
          </div>

          {/* Brand name */}
          <p className="text-3xl font-extrabold tracking-wide text-white">
            Medha{' '}<span style={{color: '#a78bfa'}}>AI</span>
          </p>

          {/* Tagline */}
          <h1 className="text-xl font-bold text-white leading-snug">
            Learn Smarter. Achieve More.
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed" style={{maxWidth: '270px'}}>
            Your AI study companion that understands, summarizes and helps you learn better.
          </p>
        </div>

        {/* ── Bottom: Book + glow illustration ── */}
        <div className="absolute bottom-0 left-0 right-0" style={{height: '280px'}}>
          <svg viewBox="0 0 500 280" fill="none" xmlns="http://www.w3.org/2000/svg"
               style={{width: '100%', height: '100%'}}>
            <defs>
              <radialGradient id="fp-book-glow" cx="50%" cy="55%" r="45%">
                <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.95"/>
                <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.55"/>
                <stop offset="60%" stopColor="#4c1d95" stopOpacity="0.20"/>
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="fp-floor-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45"/>
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
              </radialGradient>
            </defs>

            {/* Floor glow under book */}
            <ellipse cx="250" cy="250" rx="180" ry="40" fill="url(#fp-floor-glow)"/>

            {/* Vertical light beam from book center */}
            <ellipse cx="250" cy="155" rx="38" ry="130" fill="url(#fp-book-glow)"/>

            {/* Bright central spark */}
            <ellipse cx="250" cy="210" rx="12" ry="18" fill="#ede9fe" opacity="0.90"/>
            <circle cx="250" cy="210" r="6" fill="white" opacity="0.95"/>

            {/* Open book — left page */}
            <path d="M80 228 L246 208 L246 256 L80 272 Z"
                  fill="#130928" stroke="#3b0764" strokeWidth="1.2"/>
            <line x1="100" y1="232" x2="230" y2="220" stroke="#4c1d95" strokeWidth="1" opacity="0.5"/>
            <line x1="100" y1="240" x2="230" y2="228" stroke="#4c1d95" strokeWidth="1" opacity="0.4"/>
            <line x1="100" y1="248" x2="230" y2="236" stroke="#4c1d95" strokeWidth="1" opacity="0.3"/>

            {/* Open book — right page */}
            <path d="M254 208 L420 224 L420 270 L254 256 Z"
                  fill="#130928" stroke="#3b0764" strokeWidth="1.2"/>
            <line x1="270" y1="220" x2="400" y2="230" stroke="#4c1d95" strokeWidth="1" opacity="0.5"/>
            <line x1="270" y1="228" x2="400" y2="238" stroke="#4c1d95" strokeWidth="1" opacity="0.4"/>
            <line x1="270" y1="236" x2="400" y2="246" stroke="#4c1d95" strokeWidth="1" opacity="0.3"/>

            {/* Book spine */}
            <path d="M246 208 L254 208 L254 256 L246 256 Z" fill="#6d28d9"/>

            {/* ── Floating card LEFT ── */}
            <g transform="translate(100,80) rotate(-18)">
              <rect width="88" height="108" rx="7" fill="#180d38" stroke="#6d28d9" strokeWidth="1.5"/>
              <circle cx="22" cy="22" r="11" fill="#4c1d95" opacity="0.9"/>
              <circle cx="22" cy="22" r="6" fill="#7c3aed" opacity="0.8"/>
              <rect x="12" y="44" width="64" height="4" rx="2" fill="#5b21b6" opacity="0.85"/>
              <rect x="12" y="53" width="55" height="4" rx="2" fill="#4c1d95" opacity="0.7"/>
              <rect x="12" y="62" width="60" height="4" rx="2" fill="#4c1d95" opacity="0.7"/>
              <rect x="12" y="71" width="46" height="4" rx="2" fill="#4c1d95" opacity="0.55"/>
              <rect x="12" y="88" width="64" height="4" rx="2" fill="#4c1d95" opacity="0.4"/>
              <rect x="12" y="97" width="50" height="4" rx="2" fill="#4c1d95" opacity="0.35"/>
            </g>

            {/* ── Floating card CENTER ── */}
            <g transform="translate(207,30) rotate(3)">
              <rect width="86" height="100" rx="7" fill="#180d38" stroke="#7c3aed" strokeWidth="1.5"/>
              <rect x="12" y="18" width="62" height="4" rx="2" fill="#8b5cf6" opacity="0.9"/>
              <rect x="12" y="28" width="54" height="4" rx="2" fill="#5b21b6" opacity="0.75"/>
              <rect x="12" y="38" width="58" height="4" rx="2" fill="#4c1d95" opacity="0.7"/>
              <rect x="12" y="48" width="44" height="4" rx="2" fill="#4c1d95" opacity="0.6"/>
              <rect x="12" y="64" width="62" height="4" rx="2" fill="#4c1d95" opacity="0.45"/>
              <rect x="12" y="74" width="50" height="4" rx="2" fill="#4c1d95" opacity="0.4"/>
              <rect x="12" y="84" width="55" height="4" rx="2" fill="#4c1d95" opacity="0.35"/>
            </g>

            {/* ── Floating card RIGHT ── */}
            <g transform="translate(310,95) rotate(20)">
              <rect width="80" height="96" rx="7" fill="#180d38" stroke="#5b21b6" strokeWidth="1.5"/>
              <circle cx="20" cy="22" r="9" fill="#3b0764" opacity="0.9"/>
              <circle cx="20" cy="22" r="5" fill="#6d28d9" opacity="0.8"/>
              <rect x="10" y="42" width="60" height="4" rx="2" fill="#7c3aed" opacity="0.85"/>
              <rect x="10" y="51" width="50" height="4" rx="2" fill="#4c1d95" opacity="0.7"/>
              <rect x="10" y="60" width="55" height="4" rx="2" fill="#4c1d95" opacity="0.65"/>
              <rect x="10" y="76" width="60" height="4" rx="2" fill="#4c1d95" opacity="0.45"/>
              <rect x="10" y="85" width="46" height="4" rx="2" fill="#4c1d95" opacity="0.35"/>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? "Enter your email" : "Reset your password"}
            </h2>
            <p className="text-sm text-slate-400">
              {step === 1 
                ? "We'll send you a link to reset your password" 
                : "Create a new secure password for your account"
              }
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-medha-button text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <input
                    id="newPassword" type={showPassword ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-300 text-center">
                  {success}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-medha-button text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Remember your password?{" "}
            <Link to="/login" className="font-bold text-violet-400 hover:text-violet-300">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
