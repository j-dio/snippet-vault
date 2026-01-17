import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import SnippetCard from "./components/SnippetCard";
import SnippetForm from "./components/SnippetForm";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import styles from "./App.module.css";

function App() {
  const [session, setSession] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter snippets based on search query (title and code, case-insensitive)
  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) {
      return snippets;
    }
    const query = searchQuery.toLowerCase();
    return snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.code.toLowerCase().includes(query)
    );
  }, [snippets, searchQuery]);

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

  const handleLogin = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      toast.error(error.error_description || error.message);
    } else {
      toast.success("Check your email for the login link!");
    }
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

  async function addSnippet(formData) {
    // insert into supabase
    // (rls policy will check if the user is logged in)
    // default value setting will add User ID
    const { data, error } = await supabase
      .from("snippets")
      .insert([{
        title: formData.title,
        code: formData.code,
        language: formData.language,
        tags: formData.tags
      }])
      .select();

    if (error) {
      console.log("Error adding snippet:", error);
      toast.error("Error adding snippet. Check your database permissions.");
    } else {
      // update local state to show the new snippet
      setSnippets([data[0], ...snippets]);
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
          <Header
            onSignOut={() => supabase.auth.signOut()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <SnippetForm onSubmit={addSnippet} />
        <div className={styles.snippetGrid}>
          {filteredSnippets.map((snippet) => (
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
      <LoginForm onSubmit={handleLogin} />
    </>
  );
}

export default App;
