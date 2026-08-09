import { useState } from "react";
import { Route, Routes } from "react-router";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
// import { useEffect } from "react";
// import { getCurrentUser, logout } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
// import { useAuth } from "./context/AuthContext";
import MainPage from "./pages";
function App() {
  return (
    <div className="bg-card text-card-foreground">
      <Routes>
        <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
      </Routes>
    </div>
  );
}

export default App;
