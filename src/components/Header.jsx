import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, X, User, Sun, Moon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getLanguageDisplayName } from "../constants/languages";
import styles from "./Header.module.css";

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
  snippetCount,
  filteredCount,
}) {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Profile";

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  return (
    <>
      <nav className={styles.navbar} role="navigation">
        {/* Logo */}
        <button
          className={styles.brand}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          type="button"
        >
          <span className={styles.logoMark}>&lt;/&gt;</span>
          <span className={styles.logoText}>snippet vault</span>
        </button>

        {/* Search */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search snippets..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Search snippets"
            />
            {snippetCount > 0 && (
              <span className={styles.searchCount}>
                {filteredCount !== snippetCount ? `${filteredCount}/` : ""}{snippetCount}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            type="button"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            className={styles.profileButton}
            onClick={() => navigate("/profile")}
            aria-label="View profile"
            type="button"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className={styles.avatarSmall} />
            ) : (
              <User size={15} />
            )}
            <span className={styles.profileName}>{displayName}</span>
          </button>

          <button
            className={styles.signOutButton}
            onClick={onSignOut}
            aria-label="Sign out"
            type="button"
          >
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* Filters bar */}
      {(allTags.length > 0 || languageOptions.length > 0) && (
        <div className={styles.filtersBar}>
          <div className={styles.tagList}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagPill} ${
                  selectedTags.includes(tag) ? styles.tagPillActive : ""
                }`}
                onClick={() => onTagToggle(tag)}
                aria-pressed={selectedTags.includes(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={styles.filterControls}>
            {hasActiveFilters && (
              <button
                className={styles.clearButton}
                onClick={onClearFilters}
                type="button"
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
                  {getLanguageDisplayName(language)} ({count})
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
