import CodeBlock from "./CodeBlock";
import styles from "./SnippetCard.module.css";

function SnippetCard({ snippet, onCopy, onDelete }) {
  const language = snippet.language || "plaintext";

  return (
    <div className={styles.snippetCard}>
      <div className={styles.cardHeader}>
        <h3>{snippet.title}</h3>
        <div className={styles.cardActions}>
          <button onClick={() => onCopy(snippet.code)}>Copy 📋</button>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(snippet.id)}
          >
            Delete 🗑️
          </button>
        </div>
      </div>
      <CodeBlock code={snippet.code} language={language} />
    </div>
  );
}

export default SnippetCard;
