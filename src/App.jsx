import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // listen for changes (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  // if logged in, show the Vault
  if (session) {
    return (
      <div>
        <h1>Welcome to The Vault</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    );
  }

  // otherwise, show the login form
  return (
    <div className="container">
      <h1>Snippet Vault</h1>
      <p>Sign in via Magic Link</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required  
        />
        <button disabled={loading}>
          {loading ? 'Sending Link...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}

export default App;
