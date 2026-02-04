import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container">Loading…</div>;
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
