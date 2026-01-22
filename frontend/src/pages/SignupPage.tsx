import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAccount } from "../features/auth/authApi";

export default function SignupPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      nav("/projects", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="card authCard">
        <div className="authHeader">
          <h1 className="authTitle">Create account</h1>
          <p className="authSub">
            Browse publicly without an account. Create one to report issues and comment.
          </p>
        </div>

        {err && <div className="authError">{err}</div>}

        <form className="authForm" onSubmit={onSubmit}>
          <input
            className="authInput"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            className="authInput"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="authInput"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <input
            className="authInput"
            placeholder="Confirm password"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className="authRow">
            <span className="muted">Already have an account?</span>
            <Link className="link" to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
