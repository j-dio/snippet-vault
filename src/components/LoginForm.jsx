import { useState } from "react";
import styles from "./LoginForm.module.css";

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(email);
    setLoading(false);
  };

  return (
    <main className={styles.container} role="main">
      <h1>Snippet Vault</h1>
      <p>Sign in via Magic Link</p>
      <form onSubmit={handleSubmit} aria-label="Sign in form">
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
          aria-label={loading ? "Sending magic link" : "Send magic link to your email"}
        >
          {loading ? "Sending Link..." : "Send Magic Link"}
        </button>
      </form>
    </main>
  );
}

export default LoginForm;
