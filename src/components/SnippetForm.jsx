import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
      {isEditing ? (
        <div className={styles.editingHeader}>
          Editing: {editingSnippet.title}
        </div>
      ) : (
        <div className={styles.formHeader}>
          <Plus size={16} />
          <span>Add New Snippet</span>
        </div>
      )}

      <div className={styles.formRow}>
        <input
          type="text"
          placeholder="Title"
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
          placeholder="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          aria-label="Tags, comma-separated"
        />
      </div>

      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="3"
        aria-label="Code snippet"
        required
      />

      <div className={styles.formActions}>
        <button type="submit">
          {isEditing ? "Update" : "Save"}
        </button>
        {isEditing && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SnippetForm;
