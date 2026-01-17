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

// Sort option labels
const sortOptions = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "language", label: "Language" },
];

function Header({
  onSignOut,
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  languageOptions,
  allTags,
  selectedTags,
  onTagToggle,
  onClearFilters,
  hasActiveFilters,
  sortOption,
  onSortChange,
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
      <div className={styles.headerTop}>
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
          <select
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className={styles.signOutButton} onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className={styles.tagSection}>
          <div className={styles.tagList}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagPill} ${
                  selectedTags.includes(tag) ? styles.tagPillActive : ""
                }`}
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={onClearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
