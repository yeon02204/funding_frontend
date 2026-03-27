/* ─────────────────────────────────────────
   components/common/PopularItem.jsx
───────────────────────────────────────── */
import { useNavigate } from "react-router-dom";
import { calcPct } from "../../utils/format";
import Badge from "../ui/Badge";
import styles from "./PopularItem.module.css";

export default function PopularItem({ project, rank }) {
  const navigate = useNavigate();
  const pct = calcPct(project.currentAmount, project.goalAmount);

  return (
    <div
      className={styles.item}
      onClick={() => navigate(`/projects/${project.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && navigate(`/projects/${project.id}`)}
    >
      <span className={styles.rank}>{rank}</span>
      <div className={styles.thumb}>
        <img src={project.thumbnailUrl} alt="" loading="lazy" />  {/* thumbnail → thumbnailUrl */}
      </div>
      <div className={styles.info}>
        <p className={styles.creator}>{project.creator}</p>
        <p className={`${styles.title} truncate-2`}>{project.title}</p>
        <div className={styles.badges}>
          {project.badge  && <Badge small>{`♦ ${project.badge}`}</Badge>}
          {project.urgent && <Badge small variant="red">오늘 마감</Badge>}
        </div>
        <p className={styles.pct}>{pct.toLocaleString()}% 달성</p>
      </div>
    </div>
  );
}
