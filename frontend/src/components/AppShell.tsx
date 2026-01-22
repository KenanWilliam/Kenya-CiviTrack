import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearTokens, isLoggedIn } from "../features/auth/tokens";

function linkClass({ isActive }: { isActive: boolean }) {
  return `navLink ${isActive ? "navLinkActive" : ""}`;
}

export default function AppShell() {
  const nav = useNavigate();
  const authed = isLoggedIn();

  function logout() {
    clearTokens();
    nav("/login", { replace: true });
  }

  return (
    <>
      <header className="header">
        <div className="headerInner">
          <div className="brand">
            <div className="brandTitle">Kenya-CiviTrack</div>
            <div className="brandSub">Explore • verify • accountability</div>
          </div>

          <nav className="nav">
            <NavLink className={linkClass} to="/">Home</NavLink>
            <NavLink className={linkClass} to="/explore">Explore</NavLink>
            <NavLink className={linkClass} to="/projects">Projects</NavLink>

            {authed ? (
              <>
                <NavLink className={linkClass} to="/admin">Admin</NavLink>
                <button className="btn btnDanger" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className={linkClass} to="/login">Login</NavLink>
                <NavLink className={linkClass} to="/signup">Sign up</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
