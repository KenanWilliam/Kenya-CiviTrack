import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../features/auth/authApi";
import { useAuth } from "../features/auth/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function LoginPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/projects";

  useEffect(() => {
    if (user) nav(next, { replace: true });
  }, [user, nav, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      await refreshUser();
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <Card className="authCard stack">
        <div>
          <h1 className="authTitle">Welcome back</h1>
          <p className="muted">
            Sign in to report issues, comment, and access role-based dashboards.
          </p>
        </div>

        {err && <div className="authError">{err}</div>}

        <form className="stack" onSubmit={onSubmit}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="inlineList">
          <Link className="btn btnGhost" to="/signup">Create an account</Link>
          <Link className="btn btnGhost" to="/explore">Continue browsing</Link>
        </div>
      </Card>
    </div>
  );
}
