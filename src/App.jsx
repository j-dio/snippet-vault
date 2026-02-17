import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import VaultPage from "./pages/VaultPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import ProfilePage from "./pages/ProfilePage";

const toastOptions = {
  style: {
    background: '#252526',
    color: '#d4d4d4',
    border: '1px solid #3e3e42',
  },
  success: {
    iconTheme: {
      primary: '#4ec9b0',
      secondary: '#252526',
    },
  },
  error: {
    iconTheme: {
      primary: '#f48771',
      secondary: '#252526',
    },
  },
};

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={toastOptions} />
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
