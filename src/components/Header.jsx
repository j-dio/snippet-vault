import { useState, useEffect } from "react";
import styles from "./Header.module.css";

function Header({ onSignOut, searchQuery, onSearchChange }) {
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
        <button className={styles.signOutButton} onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Header;
