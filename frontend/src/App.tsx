import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import ExplorePage from "./pages/ExplorePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetails";

import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapsPage";
import AdminPage from "./pages/AdminPage";

// Temporary placeholder until we implement it
function SignupPlaceholder() {
  return <div className="card" style={{ padding: 16 }}>Signup page next.</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public + shared layout */}
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPlaceholder />} />
          <Route path="/signup" element={<SignupPage />} />


          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/map" element={<MapPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
