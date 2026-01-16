import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import SnippetCard from "./components/SnippetCard";
import styles from "./App.module.css";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const [newTags, setNewTags] = useState("");

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
      toast.error(error.error_description || error.message);
    } else {
      toast.success("Check your email for the login link!");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      // supabase auto filters it to show only your data since RLS is enabled
      const fetchSnippets = async () => {
        const { data, error } = await supabase
          .from("snippets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.log("Error fetching", error);
        else setSnippets(data);
      };

      fetchSnippets();
    }
  }, [session]);

  async function addSnippet() {
    // basic validation
    if (!newTitle || !newCode) return;

    // parse tags from comma-separated string
    const tagsArray = newTags
      ? newTags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
      : [];

    // insert into supabase
    // (rls policy will check if the user is logged in)
    // default value setting will add User ID
    const { data, error } = await supabase
      .from("snippets")
      .insert([{
        title: newTitle,
        code: newCode,
        language: newLanguage,
        tags: tagsArray
      }])
      .select();

    if (error) {
      console.log("Error adding snippet:", error);
      toast.error("Error adding snippet. Check your database permissions.");
    } else {
      // update local state to show the new snippet
      setSnippets([data[0], ...snippets]);
      setNewTitle("");
      setNewCode("");
      setNewLanguage("javascript");
      setNewTags("");
      toast.success("Snippet saved successfully!");
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
      toast.error("Failed to copy to clipboard");
    }
  }

  async function deleteSnippet(id) {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      console.log("Error", error);
      toast.error("Failed to delete snippet");
    } else {
      setSnippets(snippets.filter((snippet) => snippet.id !== id));
      toast.success("Snippet deleted successfully!");
    }
  }

  if (session) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
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
          }}
        />
        <div className={styles.vaultContainer}>
          <div className={styles.header}>
            <h1>My Snippet Vault</h1>
            <button className={styles.signOutButton} onClick={() => supabase.auth.signOut()}>
              Sign Out
            </button>
          </div>

        <div className={styles.snippetForm}>
          <input
            type="text"
            placeholder="Snippet Title (e.g., Git Undo)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="typescript">TypeScript</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="text">Plain Text</option>
          </select>
          <input
            type="text"
            placeholder="Tags (comma-separated, e.g., react, hooks, state)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />
          <textarea
            placeholder="Paste your code here..."
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            rows="4"
          />
          <button onClick={addSnippet}>Save Snippet</button>
        </div>
        <div className={styles.snippetGrid}>
          {snippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onCopy={copyToClipboard}
              onDelete={deleteSnippet}
            />
          ))}
        </div>
      </div>
      </>
    );
  }

  // otherwise, show the login form
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
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
        }}
      />
      <div className={styles.container}>
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
    </>
  );
}

export default App;
