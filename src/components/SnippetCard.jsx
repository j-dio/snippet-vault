import { useState, memo } from "react";
import CodeBlock from "./CodeBlock";
import styles from "./SnippetCard.module.css";

const MAX_COLLAPSED_LINES = 10;

const SnippetCard = memo(function SnippetCard({ snippet, onCopy, onDelete, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const language = snippet.language || "plaintext";
  const codeLines = snippet.code.split("\n");
  const isLongCode = codeLines.length > MAX_COLLAPSED_LINES;

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
    <div className={styles.snippetCard}>
      <div className={styles.cardHeader}>
        <h3>{snippet.title}</h3>
        <div className={styles.cardActions}>
          <button onClick={() => onEdit(snippet)}>Edit ✏️</button>
          <button onClick={() => onCopy(snippet.code)}>Copy 📋</button>
          <button
            className={styles.deleteButton}
            onClick={handleDeleteClick}
          >
            Delete 🗑️
          </button>
        </div>
      </div>

      <div className={styles.codeContainer}>
        <CodeBlock code={displayCode} language={language} />
        {isLongCode && (
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less ▲" : `Show more (${codeLines.length} lines) ▼`}
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteConfirm}>
          <p>Delete this snippet?</p>
          <div className={styles.confirmActions}>
            <button
              className={styles.confirmButton}
              onClick={handleConfirmDelete}
            >
              Yes, delete
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SnippetCard;
