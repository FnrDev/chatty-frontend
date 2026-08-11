import { Navigate, Route, Routes } from "react-router";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
// import { useEffect } from "react";
// import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
// import { useAuth } from "./context/AuthContext";
import Workspaces from "./pages/Workspaces";
import WorkSpaceApp from "./pages/app";
import Chat from "./components/Chat";
import { useAuth } from "./context/AuthContext";

function DefaultRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return <Navigate to={user ? "/workspaces" : "/sign-in"} replace />;
}

function App() {
  return (
    <div className="bg-card text-card-foreground">
      <Routes>
        <Route path="/" element={<DefaultRoute />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute><WorkSpaceApp /></ProtectedRoute>} />
        <Route path="/workspaces/:id/:channelId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
