import styles from "./Header.module.css";

function Header({ onSignOut }) {
  return (
    <div className={styles.header}>
      <h1>My Snippet Vault</h1>
      <button className={styles.signOutButton} onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}

export default Header;
