import { useState } from "react";
import { Route, Routes } from "react-router";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
// import { useEffect } from "react";
// import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
// import { useAuth } from "./context/AuthContext";
import Workspaces from "./pages/Workspaces";
import WorkSpaceApp from "./pages/app";
function App() {
  return (
    <div className="bg-card text-card-foreground">
      <Routes>
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute><WorkSpaceApp /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
