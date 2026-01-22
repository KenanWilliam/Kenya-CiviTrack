import { setTokens, type Tokens } from "./tokens";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

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
