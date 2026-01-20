import { useState, useEffect } from "react";
import { Search, LogOut, X, Code2 } from "lucide-react";
import styles from "./Header.module.css";

// Display names for languages
const languageDisplayNames = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  gdscript: "GDScript",
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
  { value: "date-desc", label: "Newest" },
  { value: "date-asc", label: "Oldest" },
  { value: "title-asc", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
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
    <>
      {/* Top Navbar */}
      <nav className={styles.navbar} role="navigation">
        <div className={styles.brand}>
          <Code2 size={20} className={styles.brandIcon} />
          <span>SnippetVault</span>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search snippets..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Search snippets"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.signOutButton}
            onClick={onSignOut}
            aria-label="Sign out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Tags & Filters Row */}
      {(allTags.length > 0 || languageOptions.length > 0) && (
        <div className={styles.tagSection}>
          <div className={styles.tagList}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagPill} ${
                  selectedTags.includes(tag) ? styles.tagPillActive : ""
                }`}
                onClick={() => onTagToggle(tag)}
                aria-pressed={selectedTags.includes(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={styles.filtersRow}>
            {hasActiveFilters && (
              <button
                className={styles.clearFiltersButton}
                onClick={onClearFilters}
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            )}

            <select
              className={styles.filterSelect}
              value={languageFilter}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Filter by language"
            >
              <option value="">All Languages</option>
              {languageOptions.map(({ language, count }) => (
                <option key={language} value={language}>
                  {getDisplayName(language)} ({count})
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort by"
            >
              {sortOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
