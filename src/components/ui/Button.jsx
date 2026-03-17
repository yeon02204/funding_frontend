/* ─────────────────────────────────────────
   components/ui/Button.jsx
───────────────────────────────────────── */
import styles from "./Button.module.css";
import { cx } from "../../utils/format";

/**
 * variant: "primary" | "secondary" | "outline" | "ghost" | "danger"
 * size:    "sm" | "md" | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth && styles.full,
        loading  && styles.loading,
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
