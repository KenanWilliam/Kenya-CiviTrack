import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearTokens } from "../features/auth/tokens";

function linkClass({ isActive }: { isActive: boolean }) {
  return `navLink ${isActive ? "navLinkActive" : ""}`;
}

export default function AppShell() {
  const nav = useNavigate();

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
            <div className="brandSub">Track public projects • transparency • feedback</div>
          </div>

          <nav className="nav">
            <NavLink className={linkClass} to="/projects">Projects</NavLink>
            <NavLink className={linkClass} to="/map">Map</NavLink>
            <NavLink className={linkClass} to="/admin">Admin</NavLink>
            <button className="btn btnDanger" onClick={logout}>Logout</button>
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
