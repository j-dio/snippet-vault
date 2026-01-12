import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");

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

  useEffect(() => {
    if (session) {
      // supabase auto filters it to show only your data since RLS is enabled
      const fetchSnippets = async () => {
        const { data, error } = await supabase.from("snippets").select("*");

        if (error) console.log("Error fetching", error);
        else setSnippets(data);
      };

      fetchSnippets();
    }
  }, [session]);

  async function addSnippet() {
    // basic validation
    if (!newTitle || !newCode) return;

    // insert into supabase
    // (rls policy will check if the user is logged in)
    // default value setting will add User ID
    const { data, error } = await supabase
      .from("snippets")
      .insert([{ title: newTitle, code: newCode }])
      .select();

    if (error) {
      console.log("Error adding snippet:", error);
      alert("Error adding snippet. Did you forget the INSERT policy?");
    } else {
      // update local state to show the new snippet
      setSnippets([...snippets, data[0]]);
      setNewTitle("");
      setNewCode("");
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  async function deleteSnippet(id) {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      console.log("Error", error);
    } else {
      setSnippets(snippets.filter((snippet) => snippet.id !== id));
    }
  }

  if (session) {
    return (
      <div className="vault-container">
        <h1>My Snippet Vault</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>

        <div className="snippet-form" style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Snippet Title (e.g., Git Undo)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ display: "block", marginBottom: "10px", padding: "8px" }}
          />
          <textarea
            placeholder="Paste your code here..."
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            rows="4"
            style={{
              display: "block",
              marginBottom: "10px",
              width: "100%",
              padding: "8px",
            }}
          />
          <button onClick={addSnippet}>Save Snippet</button>
        </div>
        <div className="snippet-grid">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="snippet-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>{snippet.title}</h3>
                <button onClick={() => copyToClipboard(snippet.code)}>
                  Copy 📋
                </button>
                <button onClick={() => deleteSnippet(snippet.id)}>
                  Delete 🗑️
                </button>
              </div>
              <pre>{snippet.code}</pre>
            </div>
          ))}
        </div>
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
          {loading ? "Sending Link..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}

export default App;
