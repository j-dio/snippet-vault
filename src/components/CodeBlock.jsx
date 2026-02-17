import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getLanguageDisplayName } from "../constants/languages";
import styles from "./CodeBlock.module.css";

function CodeBlock({ code, language = "plaintext" }) {
  const displayName = getLanguageDisplayName(language);

  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.languageBadge}>{displayName}</div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 6px 6px",
          fontSize: "0.875rem",
          lineHeight: "1.75",
          flex: 1,
          minHeight: "80px",
        }}
        showLineNumbers={false}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;
