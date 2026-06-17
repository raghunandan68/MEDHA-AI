const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "medha_auth_token";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

function decodeToken(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    clearToken();
    localStorage.removeItem("medha_user");
    onUnauthorized?.();
    throw new ApiError("Session expired", 401);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    if (resp.status === 401 && token) {
      clearToken();
      localStorage.removeItem("medha_user");
      onUnauthorized?.();
    }
    const body = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new ApiError(body.detail ?? "Request failed", resp.status);
  }

  return resp.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: async <T>(path: string, file: File): Promise<T> => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      clearToken();
      localStorage.removeItem("medha_user");
      onUnauthorized?.();
      throw new ApiError("Session expired", 401);
    }
    const formData = new FormData();
    formData.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resp = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!resp.ok) {
      if (resp.status === 401 && token) {
        clearToken();
        localStorage.removeItem("medha_user");
        onUnauthorized?.();
      }
      const body = await resp.json().catch(() => ({ detail: resp.statusText }));
      throw new ApiError(body.detail ?? "Upload failed", resp.status);
    }
    return resp.json();
  },
};
