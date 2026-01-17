import styles from "./LoadingSpinner.module.css";

function LoadingSpinner({ message = "Loading snippets..." }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
