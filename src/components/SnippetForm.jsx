import { useState } from "react";
import styles from "./SnippetForm.module.css";

function SnippetForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");

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

    // Clear form
    setTitle("");
    setCode("");
    setLanguage("javascript");
    setTags("");
  };

  return (
    <div className={styles.snippetForm}>
      <input
        type="text"
        placeholder="Snippet Title (e.g., Git Undo)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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
      />
      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="4"
      />
      <button onClick={handleSubmit}>Save Snippet</button>
    </div>
  );
}

export default SnippetForm;
