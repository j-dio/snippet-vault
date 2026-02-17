import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import SnippetCard from "../components/SnippetCard";
import SnippetForm from "../components/SnippetForm";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import styles from "./VaultPage.module.css";

function VaultPage({ session }) {
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

    if (languageFilter) {
      filtered = filtered.filter(
        (snippet) => (snippet.language || "plaintext") === languageFilter
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((snippet) => {
        if (!snippet.tags || !Array.isArray(snippet.tags)) return false;
        return selectedTags.every((tag) => snippet.tags.includes(tag));
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.code.toLowerCase().includes(query)
      );
    }

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
    if (session?.user?.id) {
      const fetchSnippets = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("snippets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) toast.error("Error fetching snippets");
        else setSnippets(data);
        setLoading(false);
      };

      fetchSnippets();
    }
  }, [session?.user?.id]);

  const addSnippet = useCallback(async (formData) => {
    const { data, error } = await supabase
      .from("snippets")
      .insert([{
        title: formData.title,
        use_case: formData.use_case,
        code: formData.code,
        language: formData.language,
        tags: formData.tags
      }])
      .select();

    if (error) {
      toast.error("Error adding snippet. Check your database permissions.");
    } else {
      setSnippets((prev) => [data[0], ...prev]);
      toast.success("Snippet saved successfully!");
    }
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  const deleteSnippet = useCallback(async (id) => {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete snippet");
    } else {
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
      toast.success("Snippet deleted successfully!");
    }
  }, []);

  const updateSnippet = useCallback(async (formData) => {
    if (!editingSnippet) {
      toast.error("Error updating snippet.");
      return;
    }

    const snippetId = editingSnippet.id;
    const { error } = await supabase
      .from("snippets")
      .update({
        title: formData.title,
        use_case: formData.use_case,
        code: formData.code,
        language: formData.language,
        tags: formData.tags
      })
      .eq("id", snippetId);

    if (error) {
      toast.error("Error updating snippet.");
    } else {
      const updatedSnippet = {
        ...editingSnippet,
        title: formData.title,
        use_case: formData.use_case,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingSnippet(null);
  }, []);

  return (
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
  );
}

export default VaultPage;
