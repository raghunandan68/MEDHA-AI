import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import type { User } from "../types";

const SETTINGS_KEYS = {
  THEME: "medha_theme",
  ANIMATIONS: "medha_animations",
} as const;

function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(SETTINGS_KEYS.THEME, theme);
}

function applyAnimations(enabled: boolean) {
  if (enabled) {
    document.documentElement.removeAttribute("data-animations");
  } else {
    document.documentElement.setAttribute("data-animations", "disabled");
  }
  localStorage.setItem(SETTINGS_KEYS.ANIMATIONS, String(enabled));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
        checked ? "bg-violet-600" : "bg-slate-800"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useOutletContext<{ user: User }>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem(SETTINGS_KEYS.THEME) || "dark");
  const [animations, setAnimations] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEYS.ANIMATIONS);
    return saved === null ? true : saved === "true";
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyAnimations(animations);
  }, [animations]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(""); setSuccess(""); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setError("All fields are required");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setError("New passwords do not match");
      return;
    }
    try {
      await api.post("/api/auth/change-password", {
        current_password: passwordForm.current,
        new_password: passwordForm.newPass,
      });
      setShowPasswordModal(false);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setShowCurrent(false); setShowNew(false); setShowConfirm(false);
      setSuccess("Password changed successfully. Logging out...");
      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      await api.delete("/api/auth/account");
      await logout();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete account");
      setDeleting(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-violet-500" />
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">Settings</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Profile / Settings</h1>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <div className="bg-medha-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover border-2 border-violet-500/50"
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-[#120c26]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || "User"}</h2>
            <p className="text-sm text-slate-400">{user?.email || ""}</p>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-medha-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Appearance</h3>
          <div className="space-y-3">
            <label className="text-xs text-slate-400 block">Theme</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "dark"}
                  onChange={() => handleThemeChange("dark")}
                  className="accent-violet-500 h-4 w-4"
                />
                Dark
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "light"}
                  onChange={() => handleThemeChange("light")}
                  className="accent-violet-500 h-4 w-4"
                />
                Light
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-medha-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Animations</span>
              <Toggle checked={animations} onChange={setAnimations} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Management */}
        <div className="bg-medha-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Account</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setError(""); setSuccess(""); setShowPasswordModal(true); setShowCurrent(false); setShowNew(false); setShowConfirm(false); }}
              className="w-full flex items-center justify-between rounded-xl border border-white/[0.03] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05] transition-all"
            >
              <span>Change Password</span>
              <span>&gt;</span>
            </button>
            <button
              onClick={() => { setError(""); setSuccess(""); setShowDeleteModal(true); }}
              className="w-full flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-all"
            >
              <span>Delete Account</span>
              <span>&gt;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-medha-card rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-bold text-white">Change Password</h3>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full rounded-xl border border-violet-500/20 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showCurrent ? (
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
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="w-full rounded-xl border border-violet-500/20 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showNew ? (
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
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full rounded-xl border border-violet-500/20 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirm ? (
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
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowPasswordModal(false); setPasswordForm({ current: "", newPass: "", confirm: "" }); setShowCurrent(false); setShowNew(false); setShowConfirm(false); }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-medha-button text-white text-sm font-semibold rounded-xl px-5 py-2 hover:opacity-90 transition-all"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-medha-card rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white text-sm font-semibold rounded-xl px-5 py-2 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
