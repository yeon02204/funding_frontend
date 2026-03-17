/* ─────────────────────────────────────────
   components/ui/Badge.jsx
───────────────────────────────────────── */
import { cx } from "../../utils/format";
import styles from "./Badge.module.css";

/**
 * variant: "coral" | "navy" | "green" | "yellow" | "red" | "neutral"
 */
export default function Badge({ children, variant = "coral", small = false, className }) {
  return (
    <span className={cx(styles.badge, styles[variant], small && styles.small, className)}>
      {children}
    </span>
  );
}
