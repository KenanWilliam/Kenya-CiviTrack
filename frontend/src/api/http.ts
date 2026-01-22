import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../features/auth/tokens";
import { refreshAccessToken } from "../features/auth/authApi";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

let refreshing: Promise<string> | null = null;

async function getNewAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  if (!refreshing) {
    refreshing = refreshAccessToken(refresh)
      .then(({ access }) => {
        setTokens({ access, refresh });
        return access;
      })
      .finally(() => (refreshing = null));
  }

  return refreshing;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try {
      const newAccess = await getNewAccessToken();
      const retryHeaders = new Headers(options.headers);

      if (!(options.body instanceof FormData) && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }

      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...options, headers: retryHeaders });
    } catch {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) throw new Error(await res.text());

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
