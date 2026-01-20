import { useState } from "react";
import { Plus } from "lucide-react";
import styles from "./SnippetForm.module.css";

function SnippetForm({ onSubmit, editingSnippet, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [prevEditingSnippetId, setPrevEditingSnippetId] = useState(null);

  // Sync form state when editingSnippet changes (during render, not in effect)
  const currentEditingId = editingSnippet?.id ?? null;
  if (currentEditingId !== prevEditingSnippetId) {
    setPrevEditingSnippetId(currentEditingId);
    if (editingSnippet) {
      setTitle(editingSnippet.title || "");
      setCode(editingSnippet.code || "");
      setLanguage(editingSnippet.language || "javascript");
      setTags(editingSnippet.tags ? editingSnippet.tags.join(", ") : "");
    } else {
      setTitle("");
      setCode("");
      setLanguage("javascript");
      setTags("");
    }
  }

  const handleSubmit = () => {
    if (!title || !code) return;

    // Parse tags from comma-separated string
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
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

  // Handle Tab key for indentation in code textarea
  const handleCodeKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = "  "; // 2 spaces for indentation

      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const beforeCursor = code.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf("\n") + 1;

        // Check if line starts with spaces we can remove
        if (code.substring(lineStart, lineStart + indent.length) === indent) {
          const newCode =
            code.substring(0, lineStart) +
            code.substring(lineStart + indent.length);
          setCode(newCode);
          // Adjust cursor position
          const newCursorPos = Math.max(lineStart, start - indent.length);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = newCursorPos;
          }, 0);
        }
      } else {
        // Tab: Insert indentation at cursor
        const newCode = code.substring(0, start) + indent + code.substring(end);
        setCode(newCode);
        // Move cursor after the inserted indent
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + indent.length;
        }, 0);
      }
    } else if (e.key === "Enter") {
      // Auto-indent: maintain indentation from previous line
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Find the current line's indentation
      const beforeCursor = code.substring(0, start);
      const lineStart = beforeCursor.lastIndexOf("\n") + 1;
      const currentLine = code.substring(lineStart, start);
      const match = currentLine.match(/^(\s*)/);
      const indentation = match ? match[1] : "";

      // Insert newline with same indentation
      const newCode =
        code.substring(0, start) + "\n" + indentation + code.substring(end);
      setCode(newCode);

      // Move cursor after the indentation
      const newCursorPos = start + 1 + indentation.length;
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    }
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
          <option value="gdscript">GDScript</option>
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
        onKeyDown={handleCodeKeyDown}
        rows="3"
        aria-label="Code snippet"
        required
      />

      <div className={styles.formActions}>
        <button type="submit">{isEditing ? "Update" : "Save"}</button>
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
