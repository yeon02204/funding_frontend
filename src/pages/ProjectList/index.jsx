/* ─────────────────────────────────────────
   pages/ProjectList/index.jsx — 실제 API
───────────────────────────────────────── */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../../components/common/ProjectCard";
import { useProjects } from "../../hooks/useProjects";
import styles from "./ProjectList.module.css";

const PAGE_SIZE = 12;

// 페이지 타입별 기본 파라미터
const PRESET = {
  "인기 프로젝트":  { status: "FUNDING", sortBy: "likes" },
  "신규 프로젝트":  { status: "FUNDING", sort: "createdAt,desc" },
  "마감임박":       { status: "FUNDING", sort: "deadline,asc" },  // 마감일 오름차순
  "공개예정":       { status: "APPROVED", sort: "startAt,asc" },  // 시작일 오름차순
};

export default function ProjectList({ title = "프로젝트 목록" }) {
  const navigate      = useNavigate();
  const [page, setPage] = useState(0);
  const preset        = PRESET[title] ?? { status: "FUNDING" };

  const { data, loading } = useProjects({ ...preset, page, size: PAGE_SIZE });
  const projects    = data?.content ?? [];
  const totalPages  = data?.totalPages ?? 0;

  return (
    <div className="page-wrap animate-fade-up">
      <h2 className={styles.heading}>{title}</h2>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>프로젝트가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >← 이전</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(i)}
            >{i + 1}</button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >다음 →</button>
        </div>
      )}
    </div>
  );
}
