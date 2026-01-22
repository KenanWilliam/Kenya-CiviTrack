import { getAccessToken, getRefreshToken, clearTokens } from "../features/auth/tokens";
import { refreshAccessToken } from "../features/auth/authApi";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

let refreshing: Promise<string> | null = null;

async function getFreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = refreshAccessToken().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const access = getAccessToken();
  const refresh = getRefreshToken();

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(url, { ...init, headers });

  // Try refresh once on 401
  if (res.status === 401 && refresh) {
    try {
      const newAccess = await getFreshAccessToken();
      const retryHeaders = new Headers(init.headers || {});
      if (!retryHeaders.has("Content-Type") && init.body) retryHeaders.set("Content-Type", "application/json");
      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...init, headers: retryHeaders });
    } catch {
      clearTokens();
    }
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return res.text();
  return res.json();
}
