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
    <div className={styles.container}>
      <h1>Snippet Vault</h1>
      <p>Sign in via Magic Link</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button disabled={loading}>
          {loading ? "Sending Link..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
