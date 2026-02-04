import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerAccount } from "../features/auth/authApi";
import { useAuth } from "../features/auth/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function SignupPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/projects";

  useEffect(() => {
    if (user) nav(next, { replace: true });
  }, [user, nav, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password !== password2) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerAccount({
        username: username.trim(),
        email: email.trim() || undefined,
        password,
        password2,
      });
      await refreshUser();
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <Card className="authCard stack">
        <div>
          <h1 className="authTitle">Create account</h1>
          <p className="muted">
            Browse publicly without an account. Create one to report issues and comment.
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
            label="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <div className="inlineList">
          <span className="muted">Already have an account?</span>
          <Link className="btn btnGhost" to="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
