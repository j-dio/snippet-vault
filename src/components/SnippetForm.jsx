import { useState, useEffect } from "react";
import styles from "./SnippetForm.module.css";

function SnippetForm({ onSubmit, editingSnippet, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");

  // Populate form when editing a snippet
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title || "");
      setCode(editingSnippet.code || "");
      setLanguage(editingSnippet.language || "javascript");
      setTags(editingSnippet.tags ? editingSnippet.tags.join(", ") : "");
    } else {
      // Clear form when not editing
      setTitle("");
      setCode("");
      setLanguage("javascript");
      setTags("");
    }
  }, [editingSnippet]);

  const handleSubmit = () => {
    if (!title || !code) return;

    // Parse tags from comma-separated string
    const tagsArray = tags
      ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
      : [];

    // Call parent's onSubmit with form data
    onSubmit({
      title,
      code,
      language,
      tags: tagsArray,
    });

    // Clear form only if not editing (editing clears via useEffect)
    if (!editingSnippet) {
      setTitle("");
      setCode("");
      setLanguage("javascript");
      setTags("");
    }
  };

  const handleCancel = () => {
    onCancelEdit();
  };

  const isEditing = !!editingSnippet;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form
      className={`${styles.snippetForm} ${isEditing ? styles.editing : ""}`}
      onSubmit={handleFormSubmit}
      aria-label={isEditing ? "Edit snippet form" : "Add new snippet form"}
    >
      {isEditing && (
        <div className={styles.editingHeader} role="status" aria-live="polite">
          Editing: {editingSnippet.title}
        </div>
      )}
      <input
        type="text"
        placeholder="Snippet Title (e.g., Git Undo)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Snippet title"
        required
      />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Programming language"
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
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        aria-label="Tags, comma-separated"
      />
      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="4"
        aria-label="Code snippet"
        required
      />
      <div className={styles.formActions}>
        <button type="submit" aria-label={isEditing ? "Update snippet" : "Save snippet"}>
          {isEditing ? "Update Snippet" : "Save Snippet"}
        </button>
        {isEditing && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SnippetForm;
