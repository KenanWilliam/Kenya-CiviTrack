import { getRefreshToken, setTokens, clearTokens, type Tokens } from "./tokens";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh token invalid");
  }

  const data = (await res.json()) as { access: string };

  // keep existing refresh, update only access
  const updated: Tokens = { access: data.access, refresh };
  setTokens(updated);

  return data.access;
}

export async function login(username: string, password: string): Promise<Tokens> {
  const res = await fetch(`${API_BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(await res.text());

  const data = (await res.json()) as Tokens;
  setTokens(data);
  return data;
}

export async function registerAccount(payload: {
  username: string;
  email?: string;
  password: string;
  password2: string;
}): Promise<Tokens> {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text());

  // Backend returns tokens directly
  const data = (await res.json()) as { access: string; refresh: string };
  setTokens({ access: data.access, refresh: data.refresh });
  return { access: data.access, refresh: data.refresh };
}
