import { useState, useEffect } from "react";
import { Search, LogOut, X } from "lucide-react";
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
  snippetCount,
  filteredCount,
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

  const showingFiltered = hasActiveFilters && filteredCount !== snippetCount;

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerTop}>
        <div className={styles.titleSection}>
          <h1>My Snippet Vault</h1>
          <span className={styles.snippetCount} aria-live="polite">
            {showingFiltered
              ? `${filteredCount} of ${snippetCount} snippets`
              : `${snippetCount} ${snippetCount === 1 ? "snippet" : "snippets"}`}
          </span>
        </div>
        <nav className={styles.headerControls} aria-label="Snippet filters and actions">
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search snippets..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Search snippets by title or code"
            />
          </div>
          <select
            className={styles.languageSelect}
            value={languageFilter}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Filter by programming language"
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
            aria-label="Sort snippets"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            className={styles.signOutButton}
            onClick={onSignOut}
            aria-label="Sign out of your account"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>

      {allTags.length > 0 && (
        <div className={styles.tagSection} role="group" aria-label="Filter by tags">
          <div className={styles.tagList} role="list">
            {allTags.map((tag) => (
              <button
                key={tag}
                role="listitem"
                className={`${styles.tagPill} ${
                  selectedTags.includes(tag) ? styles.tagPillActive : ""
                }`}
                onClick={() => onTagToggle(tag)}
                aria-pressed={selectedTags.includes(tag)}
                aria-label={`Filter by tag: ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              className={styles.clearFiltersButton}
              onClick={onClearFilters}
              aria-label="Clear all active filters"
            >
              <X size={14} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
