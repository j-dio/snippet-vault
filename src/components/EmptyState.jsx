import styles from "./EmptyState.module.css";

function EmptyState({ type = "no-snippets", onClearFilters }) {
  if (type === "no-results") {
    return (
      <section className={styles.emptyState} role="status" aria-live="polite">
        <div className={styles.icon} aria-hidden="true">🔍</div>
        <h2>No snippets found</h2>
        <p>Try adjusting your search or filters to find what you're looking for.</p>
        {onClearFilters && (
          <button
            className={styles.actionButton}
            onClick={onClearFilters}
            aria-label="Clear all active filters"
          >
            Clear all filters
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">📝</div>
      <h2>No snippets yet</h2>
      <p>Start building your collection by adding your first code snippet above.</p>
    </section>
  );
}

export default EmptyState;
