/* ─────────────────────────────────────────
   components/common/ProjectCard.jsx
───────────────────────────────────────── */
import { useNavigate } from "react-router-dom";
import { fmtAmount, calcPct } from "../../utils/format";
import Badge from "../ui/Badge";
import styles from "./ProjectCard.module.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const current = project.currentAmount ?? 0;
  const goal    = project.goalAmount    ?? 0;
  const pct     = project.progressPercent ?? calcPct(current, goal);

  // 남은 일수
  const daysLeft = project.deadline
    ? Math.max(0, Math.ceil((new Date(project.deadline) - Date.now()) / 86400000))
    : null;

  // 썸네일 — API는 thumbnailUrl(/uploads/...), 목데이터는 thumbnail(http://...)
  const rawThumb = project.thumbnailUrl ?? project.thumbnail ?? null;
  const thumbnail = rawThumb
    ? (rawThumb.startsWith("http") ? rawThumb : `${API_BASE}${rawThumb}`)
    : null;

  // 창작자
  const creator = project.ownerNickname ?? project.creator ?? "창작자";

  // 마감 임박
  const isUrgent = daysLeft !== null && daysLeft <= 3;

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/projects/${project.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && navigate(`/projects/${project.id}`)}
    >
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {thumbnail
          ? <img src={thumbnail} alt={project.title} loading="lazy" />
          : <div className={styles.thumbPlaceholder}>📦</div>
        }
        {project.badge && (
          <Badge variant="dark" className={styles.badgeTop}>♦ {project.badge}</Badge>
        )}
        {isUrgent && daysLeft === 0 && (
          <Badge variant="urgent" className={styles.badgeUrgent}>오늘 마감</Badge>
        )}
        {isUrgent && daysLeft > 0 && (
          <Badge variant="urgent" className={styles.badgeUrgent}>마감 임박</Badge>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.creator}>{creator}</p>

        <h3 className={`${styles.title} truncate-2`}>{project.title}</h3>

        <p className={styles.amount}>{fmtAmount(current)}</p>

        <div className="progress-bar" style={{ height: 3, margin: "6px 0" }}>
          <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>

        <p className={styles.pct}>{pct}% 달성</p>

        <div className={styles.meta}>
          {project.categoryName && (
            <span className={styles.category}>{project.categoryName}</span>
          )}
          {daysLeft !== null && (
            <span>{daysLeft === 0 ? "오늘 마감" : `${daysLeft}일 남음`}</span>
          )}
        </div>
      </div>
    </article>
  );
}
