/* ─────────────────────────────────────────
   pages/Category/index.jsx — 실제 API
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectCard from "../../components/common/ProjectCard";
import { useProjects } from "../../hooks/useProjects";
import { getCategories } from "../../api/categories";
import styles from "./Category.module.css";

const PAGE_SIZE = 12;

const CATEGORY_ICONS = {
  "보드게임·TRPG": "🎲", "디지털 게임": "🕹️", "웹툰·만화": "📖",
  "웹툰 리소스": "✏️", "디자인 문구": "📝", "캐릭터·굿즈": "🧸",
  "홈·리빙": "🏠", "테크·가전": "💻", "개발·프로그래밍": "🖥️",
  "푸드": "🍽️", "향수·뷰티": "🌸", "의류": "👗", "잡화": "👜",
  "주얼리": "💎", "반려동물": "🐾", "출판": "📚", "디자인": "🎨",
  "예술": "🖼️", "사진": "📷", "음악": "🎵", "공연": "🎭", "영화·비디오": "🎬",
};

export default function Category() {
  const { slug } = useParams();
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // slug로 카테고리 찾기 (DB 이름 기준)
  const cat = categories.find(c => c.name === slug);

  const { data, loading } = useProjects({
    status: "FUNDING",
    categoryId: cat?.id,
    page,
    size: PAGE_SIZE,
  });

  const projects   = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const icon       = CATEGORY_ICONS[slug] ?? "📦";

  return (
    <div className="page-wrap animate-fade-up">
      <div className={styles.catHead}>
        <span className={styles.catEmoji}>{icon}</span>
        <h2 className={styles.catTitle}>{slug}</h2>
        <span className={styles.catCount}>{data?.totalElements ?? projects.length}개 프로젝트</span>
      </div>

      {loading ? (
        <div className="empty-state"><p>로딩 중...</p></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{icon}</div>
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
