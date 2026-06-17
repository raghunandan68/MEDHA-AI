import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, setToken, clearToken, getToken, isTokenExpired, setOnUnauthorized } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearToken();
    localStorage.removeItem("medha_user");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem("medha_user");
    if (token && stored && !isTokenExpired(token)) {
      setToken(token);
      try {
        setUser(JSON.parse(stored));
      } catch {
        clearSession();
      }
    }
    setLoading(false);
  }, [clearSession]);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearSession();
      window.location.href = "/login";
    });
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      const res = await api.post<{
        user_id: string;
        email: string;
        name: string;
        access_token: string;
      }>("/api/auth/signin", { email, password });
      setToken(res.access_token);
      const u: User = {
        id: res.user_id,
        email: res.email,
        name: res.name,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("medha_user", JSON.stringify(u));
      setUser(u);
      return null;
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return e.message ?? "Invalid email or password";
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      await api.post<{
        user_id: string;
        email: string;
        name: string;
        access_token: string;
      }>("/api/auth/signup", { name, email, password });
      return null;
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return e.message ?? "Registration failed";
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
