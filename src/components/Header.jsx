import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, X, Code2, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getLanguageDisplayName } from "../constants/languages";
import styles from "./Header.module.css";

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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email;

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

  const getDisplayName = (lang) => getLanguageDisplayName(lang);

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
            className={styles.profileButton}
            onClick={() => navigate("/profile")}
            aria-label="View profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className={styles.avatarSmall}
              />
            ) : (
              <User size={16} />
            )}
            <span className={styles.profileName}>{displayName}</span>
          </button>
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
