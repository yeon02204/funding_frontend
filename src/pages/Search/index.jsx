/* ─────────────────────────────────────────
   pages/Search/index.jsx
───────────────────────────────────────── */
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ProjectCard from "../../components/common/ProjectCard";
import { getProjects } from "../../api/projects";
import styles from "./Search.module.css";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProjects({ keyword: q || undefined, size: 50 })
      .then(res => setResults(res?.content ?? res?.data?.content ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="page-wrap animate-fade-up">
      <h2 className={styles.heading}>
        {q
          ? <><span className="coral">"{q}"</span> 검색 결과</>
          : "전체 프로젝트"
        }
        <span className={styles.count}>{results.length}건</span>
      </h2>

      {loading ? (
        <div className="empty-state"><p>로딩 중...</p></div>
      ) : results.length === 0 ? (
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
