/* ─────────────────────────────────────────
   components/layout/Footer.jsx
───────────────────────────────────────── */
import styles from "./Footer.module.css";

const COLS = [
  {
    title: "꼬강",
    links: [
      { label: "공지사항" },
      { label: "서비스 소개" },
      { label: "채용", badge: true },
      { label: "꼬강 광고센터", highlight: true },
    ],
  },
  {
    title: "이용안내",
    links: [
      { label: "헬프 센터" },
      { label: "첫 후원 가이드" },
      { label: "창작자 가이드", highlight: true },
    ],
  },
  {
    title: "정책",
    links: [
      { label: "이용약관" },
      { label: "개인정보처리방침" },
      { label: "프로젝트 심사 기준" },
    ],
  },
  {
    title: "App",
    links: [{ label: "▶ 안드로이드" }, { label: " iOS" }],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {COLS.map(col => (
          <div key={col.title} className={styles.col}>
            <h4 className={styles.colTitle}>{col.title}</h4>
            <ul className={styles.list}>
              {col.links.map(l => (
                <li key={l.label} className={`${styles.item} ${l.highlight ? styles.highlight : ""}`}>
                  {l.label}
                  {l.badge && <span className={styles.badge}>N</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.support}>
          <h4 className={styles.colTitle}>고객지원</h4>
          <p className={styles.hours}>평일 9:30 ~ 17:00<br />(12:00 ~ 14:00 제외)</p>
          <button className={styles.contactBtn}>꼬강에 문의</button>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 꼬강. All rights reserved.</span>
      </div>
    </footer>
  );
}
