/* ─────────────────────────────────────────
   components/ui/Tabs.jsx
───────────────────────────────────────── */
import styles from "./Tabs.module.css";
import { cx } from "../../utils/format";

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className={styles.tabs}>
      {tabs.map((t) => (
        <button
          key={t}
          className={cx(styles.tab, active === t && styles.active)}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ active, value, children }) {
  if (active !== value) return null;
  return <div className={styles.panel}>{children}</div>;
}
