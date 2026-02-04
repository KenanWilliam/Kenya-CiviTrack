import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/authContext";
import Drawer from "./ui/Drawer";
import Button from "./ui/Button";

function linkClass({ isActive }: { isActive: boolean }) {
  return `navLink ${isActive ? "navLinkActive" : ""}`;
}

export default function AppShell() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const authed = !!user;
  const isStaff = user?.role === "ADMIN" || user?.role === "OFFICIAL";

  function logoutUser() {
    logout();
    nav("/login", { replace: true });
  }

  const links = (
    <>
      <NavLink className={linkClass} to="/">Home</NavLink>
      <NavLink className={linkClass} to="/explore">Explore</NavLink>
      <NavLink className={linkClass} to="/projects">Projects</NavLink>
      <NavLink className={linkClass} to="/map">Map</NavLink>
      {isStaff ? <NavLink className={linkClass} to="/admin">Admin</NavLink> : null}
    </>
  );

  const authControls = authed ? (
    <>
      <span className="badge">{user?.username}</span>
      <Button variant="ghost" onClick={logoutUser}>Logout</Button>
    </>
  ) : (
    <>
      <NavLink className={linkClass} to="/login">Login</NavLink>
      <NavLink className={linkClass} to="/signup">Sign up</NavLink>
    </>
  );

  return (
    <>
      <header className="header">
        <div className="headerInner">
          <div className="brand">
            <div className="brandTitle">Kenya-CiviTrack</div>
            <div className="brandSub">Explore • verify • accountability</div>
          </div>

          <nav className="navLinks">{links}</nav>
          <div className="navActions">{authControls}</div>
          <button className="navToggle" onClick={() => setOpen(true)} aria-label="Open navigation menu">
            ☰
          </button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Menu">
        <div className="stack">
          <div className="stack">{links}</div>
          <div className="stack">{authControls}</div>
        </div>
      </Drawer>
    </>
  );
}
