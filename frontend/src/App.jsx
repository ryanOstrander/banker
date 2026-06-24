import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("login");

  if (loading) {
    return (
      <div className="auth-page">
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-mid)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return page === "login"
      ? <Login onSwitch={() => setPage("register")} />
      : <Register onSwitch={() => setPage("login")} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
