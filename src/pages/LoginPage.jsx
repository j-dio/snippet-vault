import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const { session, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithOtp(email);

    if (error) {
      toast.error(error.error_description || error.message);
    } else {
      toast.success("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <main className={styles.container} role="main">
      <h1>Snippet Vault</h1>
      <p>Sign in via Magic Link</p>
      <form onSubmit={handleMagicLink} aria-label="Sign in form">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Sending Link..." : "Send Magic Link"}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
