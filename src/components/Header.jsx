import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  X,
  User,
  Sun,
  Moon,
  Plus,
  ChevronDown,
  Filter,
} from "lucide-react";
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
  onNewSnippet,
}) {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showAllTags, setShowAllTags] = useState(false);
  const searchInputRef = useRef(null);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || "Profile";

  // Maximum number of tags to show inline before collapsing
  const MAX_VISIBLE_TAGS = 6;
  const visibleTags = showAllTags
    ? allTags
    : allTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = allTags.length - MAX_VISIBLE_TAGS;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        {/* Search — elevated, centered, wider */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder="Search snippets..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Search snippets"
            />
            <kbd className={styles.searchKbd}>Ctrl K</kbd>
            {snippetCount > 0 && (
              <span className={styles.searchCount}>
                {filteredCount !== snippetCount ? `${filteredCount}/` : ""}
                {snippetCount}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* + New Snippet button */}
          <button
            className={styles.newSnippetButton}
            onClick={onNewSnippet}
            type="button"
          >
            <Plus size={15} />
            <span>New Snippet</span>
          </button>

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

      {/* Filters bar — collapsible tags */}
      {(allTags.length > 0 || languageOptions.length > 0) && (
        <div className={styles.filtersBar}>
          <div className={styles.filtersLeft}>
            <Filter size={13} className={styles.filterIcon} />
            <div className={styles.tagList}>
              {visibleTags.map((tag) => (
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
              {/* Show more / show less toggle */}
              {allTags.length > MAX_VISIBLE_TAGS && (
                <button
                  className={styles.moreTagsButton}
                  onClick={() => setShowAllTags(!showAllTags)}
                  type="button"
                >
                  {showAllTags ? <>Less</> : <>+{hiddenTagCount} more</>}
                  <ChevronDown
                    size={12}
                    className={showAllTags ? styles.chevronUp : ""}
                  />
                </button>
              )}
            </div>
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
