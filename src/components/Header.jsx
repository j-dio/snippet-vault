import { useState, useEffect } from "react";
import styles from "./Header.module.css";

// Display names for languages
const languageDisplayNames = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  bash: "Bash",
  plaintext: "Plain Text",
};

function Header({
  onSignOut,
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  languageOptions,
}) {
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  // Sync input value when searchQuery prop changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const getDisplayName = (lang) => languageDisplayNames[lang] || lang;

  return (
    <div className={styles.header}>
      <h1>My Snippet Vault</h1>
      <div className={styles.headerControls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search snippets..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <select
          className={styles.languageSelect}
          value={languageFilter}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="">All Languages</option>
          {languageOptions.map(({ language, count }) => (
            <option key={language} value={language}>
              {getDisplayName(language)} ({count})
            </option>
          ))}
        </select>
        <button className={styles.signOutButton} onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
