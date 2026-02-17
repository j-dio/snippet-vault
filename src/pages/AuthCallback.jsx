import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the token exchange automatically via onAuthStateChange.
    // We just need to wait briefly and redirect to the vault.
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <LoadingSpinner message="Signing you in..." />;
}

export default AuthCallback;
