import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import VaultPage from "./pages/VaultPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return null;
  }

  const toastOptions = {
    style: {
      background: theme === "dark" ? "rgba(44, 44, 46, 0.9)" : "rgba(255, 255, 255, 0.9)",
      color: theme === "dark" ? "#f5f5f7" : "#1d1d1f",
      border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
      backdropFilter: "blur(20px)",
      borderRadius: "14px",
      fontSize: "0.8125rem",
    },
    success: {
      iconTheme: {
        primary: "#34c759",
        secondary: theme === "dark" ? "#1c1c1e" : "#ffffff",
      },
    },
    error: {
      iconTheme: {
        primary: "#ff3b30",
        secondary: theme === "dark" ? "#1c1c1e" : "#ffffff",
      },
    },
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={toastOptions} />
      <Routes>
        <Route
          path="/"
          element={
            session
              ? <VaultPage />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />
        <Route
          path="/profile"
          element={<ProfilePage />}
        />
      </Routes>
    </>
  );
}

export default App;
