import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Github, Mail, Eye, EyeOff, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const { session, signInWithOAuth, signInWithPassword, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await signInWithOAuth("github");
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // OAuth redirects away, no need to setLoading(false) on success
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to confirm.");
      }
    } else {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        toast.error(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <main className={styles.container} role="main">
      <div className={styles.card}>
        <div className={styles.header}>
          <Code2 size={32} className={styles.logo} />
          <h1>Snippet Vault</h1>
          <p>Your personal code snippet manager</p>
        </div>

        <button
          className={styles.githubButton}
          onClick={handleGitHubLogin}
          disabled={loading}
          type="button"
        >
          <Github size={20} />
          <span>Continue with GitHub</span>
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form onSubmit={handleEmailSubmit} aria-label="Sign in form">
          <div className={styles.inputGroup}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              aria-label="Password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className={styles.toggleMode}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
