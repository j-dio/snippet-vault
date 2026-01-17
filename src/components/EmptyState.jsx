import styles from "./EmptyState.module.css";

function EmptyState({ type = "no-snippets", onClearFilters }) {
  if (type === "no-results") {
    return (
      <div className={styles.emptyState}>
        <div className={styles.icon}>🔍</div>
        <h2>No snippets found</h2>
        <p>Try adjusting your search or filters to find what you're looking for.</p>
        {onClearFilters && (
          <button className={styles.actionButton} onClick={onClearFilters}>
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>📝</div>
      <h2>No snippets yet</h2>
      <p>Start building your collection by adding your first code snippet above.</p>
    </div>
  );
}

export default EmptyState;
