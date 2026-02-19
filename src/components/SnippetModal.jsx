import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import styles from "./SnippetModal.module.css";

function SnippetModal({ isOpen, onClose, children }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close on clicking overlay backdrop (not the panel itself)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Snippet form"
    >
      <div className={styles.panel} ref={panelRef}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default SnippetModal;
