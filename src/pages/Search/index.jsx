/* ─────────────────────────────────────────
   pages/Search/index.jsx
───────────────────────────────────────── */
import { useSearchParams } from "react-router-dom";
import ProjectCard from "../../components/common/ProjectCard";
import { MOCK_PROJECTS } from "../../data/mockData";
import styles from "./Search.module.css";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const results = MOCK_PROJECTS.filter(p =>
    p.title.includes(q) || p.creator.includes(q) || p.tags?.some(t => t.includes(q))
  );

  return (
    <div className="page-wrap animate-fade-up">
      <h2 className={styles.heading}>
        <span className="coral">"{q}"</span> 검색 결과
        <span className={styles.count}>{results.length}건</span>
      </h2>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {results.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
