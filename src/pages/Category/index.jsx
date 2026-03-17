/* ─────────────────────────────────────────
   pages/Category/index.jsx — 실제 API
───────────────────────────────────────── */
import { useState } from "react";
import { useParams } from "react-router-dom";
import ProjectCard from "../../components/common/ProjectCard";
import { useProjects } from "../../hooks/useProjects";
import { CATEGORIES } from "../../data/mockData";
import styles from "./Category.module.css";

const PAGE_SIZE = 12;

export default function Category() {
  const { slug }  = useParams();
  const [page, setPage] = useState(0);

  // slug가 카테고리 이름 (예: "게임", "음악")
  const cat = CATEGORIES.find(c => c.id === slug || c.label === slug);

  const { data, loading } = useProjects({
    status: "FUNDING",
    keyword: cat?.label !== "전체" ? undefined : undefined,
    categoryId: undefined, // 추후 서버에서 categoryId 매핑 필요
    keyword: cat?.label && cat.id !== "all" ? cat.label : undefined,
    page,
    size: PAGE_SIZE,
  });

  const projects   = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="page-wrap animate-fade-up">
      <div className={styles.catHead}>
        <span className={styles.catEmoji}>{cat?.icon ?? "📦"}</span>
        <h2 className={styles.catTitle}>{cat?.label ?? slug}</h2>
        <span className={styles.catCount}>{data?.totalElements ?? projects.length}개 프로젝트</span>
      </div>

      {loading ? (
        <div className="empty-state"><p>로딩 중...</p></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{cat?.icon ?? "📦"}</div>
          <p>진행 중인 프로젝트가 없습니다</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← 이전</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음 →</button>
        </div>
      )}
    </div>
  );
}
