import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Toaster } from "react-hot-toast";
import VaultPage from "./pages/VaultPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
              ? <VaultPage session={session} />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={<LoginPage session={session} />}
        />
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />
      </Routes>
    </>
  );
}

export default App;
