import { useState, memo } from "react";
import CodeBlock from "./CodeBlock";
import styles from "./SnippetCard.module.css";

const MAX_COLLAPSED_LINES = 10;

// Format relative time (e.g., "2 hours ago", "3 days ago")
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

const SnippetCard = memo(function SnippetCard({ snippet, onCopy, onDelete, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const language = snippet.language || "plaintext";
  const codeLines = snippet.code.split("\n");
  const isLongCode = codeLines.length > MAX_COLLAPSED_LINES;
  const tags = snippet.tags || [];

  const displayCode = isExpanded || !isLongCode
    ? snippet.code
    : codeLines.slice(0, MAX_COLLAPSED_LINES).join("\n");

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(snippet.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <article className={styles.snippetCard} aria-labelledby={`snippet-title-${snippet.id}`}>
      <div className={styles.cardHeader}>
        <h3 id={`snippet-title-${snippet.id}`}>{snippet.title}</h3>
        <div className={styles.cardActions} role="group" aria-label="Snippet actions">
          <button
            onClick={() => onEdit(snippet)}
            aria-label={`Edit snippet: ${snippet.title}`}
          >
            Edit ✏️
          </button>
          <button
            onClick={() => onCopy(snippet.code)}
            aria-label={`Copy code from: ${snippet.title}`}
          >
            Copy 📋
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            aria-label={`Delete snippet: ${snippet.title}`}
          >
            Delete 🗑️
          </button>
        </div>
      </div>

      <div className={styles.cardMeta}>
        {snippet.created_at && (
          <time className={styles.timestamp} dateTime={snippet.created_at}>
            {formatRelativeTime(snippet.created_at)}
          </time>
        )}
        {tags.length > 0 && (
          <div className={styles.tagList} role="list" aria-label="Snippet tags">
            {tags.map((tag) => (
              <span key={tag} className={styles.tag} role="listitem">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.codeContainer}>
        <CodeBlock code={displayCode} language={language} />
        {isLongCode && (
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse code" : `Expand code (${codeLines.length} lines)`}
          >
            {isExpanded ? "Show less ▲" : `Show more (${codeLines.length} lines) ▼`}
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className={styles.deleteConfirm}
          role="alertdialog"
          aria-labelledby={`delete-title-${snippet.id}`}
          aria-describedby={`delete-desc-${snippet.id}`}
        >
          <p id={`delete-title-${snippet.id}`}>Delete this snippet?</p>
          <div className={styles.confirmActions}>
            <button
              className={styles.confirmButton}
              onClick={handleConfirmDelete}
              aria-label="Confirm delete"
            >
              Yes, delete
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancelDelete}
              aria-label="Cancel delete"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
});

export default SnippetCard;
