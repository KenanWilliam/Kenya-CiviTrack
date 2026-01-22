import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../features/auth/tokens";

export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}
