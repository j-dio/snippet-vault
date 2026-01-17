import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import SnippetCard from "./components/SnippetCard";
import SnippetForm from "./components/SnippetForm";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import LoadingSpinner from "./components/LoadingSpinner";
import styles from "./App.module.css";

function App() {
  const [session, setSession] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState("date-desc");
  const [editingSnippet, setEditingSnippet] = useState(null);

  // Get unique languages from snippets with counts
  const languageOptions = useMemo(() => {
    const langCounts = {};
    snippets.forEach((snippet) => {
      const lang = snippet.language || "plaintext";
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });
    return Object.entries(langCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => a.language.localeCompare(b.language));
  }, [snippets]);

  // Get unique tags from all snippets
  const allTags = useMemo(() => {
    const tagSet = new Set();
    snippets.forEach((snippet) => {
      if (snippet.tags && Array.isArray(snippet.tags)) {
        snippet.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [snippets]);

  // Toggle tag selection
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setLanguageFilter("");
    setSelectedTags([]);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || languageFilter || selectedTags.length > 0;

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = snippets;

    // Filter by language
    if (languageFilter) {
      filtered = filtered.filter(
        (snippet) => (snippet.language || "plaintext") === languageFilter
      );
    }

    // Filter by selected tags (snippet must have ALL selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((snippet) => {
        if (!snippet.tags || !Array.isArray(snippet.tags)) return false;
        return selectedTags.every((tag) => snippet.tags.includes(tag));
      });
    }

    // Filter by search query (title and code, case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.code.toLowerCase().includes(query)
      );
    }

    // Sort snippets
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date-asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "language":
          return (a.language || "plaintext").localeCompare(b.language || "plaintext");
        default:
          return 0;
      }
    });

    return sorted;
  }, [snippets, searchQuery, languageFilter, selectedTags, sortOption]);

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
    if (session?.user?.id) {
      // supabase auto filters it to show only your data since RLS is enabled
      const fetchSnippets = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("snippets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) console.log("Error fetching", error);
        else setSnippets(data);
        setLoading(false);
      };

      fetchSnippets();
    }
  }, [session?.user?.id]);

  const addSnippet = useCallback(async (formData) => {
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
      setSnippets((prev) => [data[0], ...prev]);
      toast.success("Snippet saved successfully!");
    }
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  const deleteSnippet = useCallback(async (id) => {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      console.log("Error", error);
      toast.error("Failed to delete snippet");
    } else {
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
      toast.success("Snippet deleted successfully!");
    }
  }, []);

  const updateSnippet = useCallback(async (formData) => {
    if (!editingSnippet) {
      console.error("No snippet being edited");
      toast.error("Error updating snippet.");
      return;
    }

    const snippetId = editingSnippet.id;
    const { error } = await supabase
      .from("snippets")
      .update({
        title: formData.title,
        code: formData.code,
        language: formData.language,
        tags: formData.tags
      })
      .eq("id", snippetId);

    if (error) {
      console.log("Error updating snippet:", error);
      toast.error("Error updating snippet.");
    } else {
      // Update local state with merged data
      const updatedSnippet = {
        ...editingSnippet,
        title: formData.title,
        code: formData.code,
        language: formData.language,
        tags: formData.tags
      };
      setSnippets((prev) => prev.map((s) => (s.id === snippetId ? updatedSnippet : s)));
      setEditingSnippet(null);
      toast.success("Snippet updated successfully!");
    }
  }, [editingSnippet]);

  const handleFormSubmit = useCallback((formData) => {
    if (editingSnippet) {
      updateSnippet(formData);
    } else {
      addSnippet(formData);
    }
  }, [editingSnippet, updateSnippet, addSnippet]);

  const handleEditSnippet = useCallback((snippet) => {
    setEditingSnippet(snippet);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingSnippet(null);
  }, []);

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
        <main className={styles.vaultContainer} role="main">
          <Header
            onSignOut={() => supabase.auth.signOut()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            languageFilter={languageFilter}
            onLanguageChange={setLanguageFilter}
            languageOptions={languageOptions}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
            snippetCount={snippets.length}
            filteredCount={filteredSnippets.length}
          />

          <SnippetForm
            onSubmit={handleFormSubmit}
            editingSnippet={editingSnippet}
            onCancelEdit={handleCancelEdit}
          />
          <section className={styles.snippetGrid} aria-label="Code snippets">
            {loading ? (
              <LoadingSpinner />
            ) : filteredSnippets.length === 0 ? (
              <EmptyState
                type={snippets.length === 0 ? "no-snippets" : "no-results"}
                onClearFilters={hasActiveFilters ? clearFilters : null}
              />
            ) : (
              filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onCopy={copyToClipboard}
                  onDelete={deleteSnippet}
                  onEdit={handleEditSnippet}
                />
              ))
            )}
          </section>
        </main>
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
