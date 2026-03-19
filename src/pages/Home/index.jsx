/* ─────────────────────────────────────────
   pages/Home/index.jsx — 실제 API 연동
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner      from "../../components/common/Banner";
import ProjectCard from "../../components/common/ProjectCard";
import PopularItem from "../../components/common/PopularItem";
import { useProjects } from "../../hooks/useProjects";
import { SHORTCUT_TABS } from "../../data/mockData";
import { getCategories } from "../../api/categories";
import styles from "./Home.module.css";

const CATEGORY_ICONS = {
  "보드게임·TRPG": "🎲", "디지털 게임": "🕹️", "웹툰·만화": "📖",
  "웹툰 리소스": "✏️", "디자인 문구": "📝", "캐릭터·굿즈": "🧸",
  "홈·리빙": "🏠", "테크·가전": "💻", "개발·프로그래밍": "🖥️",
  "푸드": "🍽️", "향수·뷰티": "🌸", "의류": "👗", "잡화": "👜",
  "주얼리": "💎", "반려동물": "🐾", "출판": "📚", "디자인": "🎨",
  "예술": "🖼️", "사진": "📷", "음악": "🎵", "공연": "🎭", "영화·비디오": "🎬",
};

export default function Home() {
  const [notice, setNotice] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const { data: popularData } = useProjects({ status: "FUNDING", sortBy: "likes", size: 4 });
  const { data: newData, loading: newLoading } = useProjects({ status: "FUNDING", size: 8 });

  const popular = popularData?.content ?? [];
  const newList = newData?.content ?? [];

  return (
    <>
      {notice && (
        <div className={styles.notice}>
          <span>✨</span>
          새로 생긴 상시 프로젝트를 확인해보세요
          <button className={styles.noticeClose} onClick={() => setNotice(false)}>×</button>
        </div>
      )}

      <div className="page-wrap">
        <div className="two-col">
          <div>
            <section className={`${styles.section} animate-fade-up`}>
              <Banner />
            </section>

            {/* 카테고리 단축 탭 */}
            <section className={`${styles.section} animate-fade-up-1`}>
              <div className={`${styles.catRow} no-scrollbar`}>
                {/* 고정 숏컷 탭 */}
                {SHORTCUT_TABS.map(c => (
                  <button
                    key={c.label}
                    className={styles.catItem}
                    onClick={() => c.path && navigate(c.path)}
                  >
                    <div className={styles.catIcon}>{c.icon}</div>
                    <span className={styles.catLabel}>{c.label}</span>
                  </button>
                ))}
                {/* DB 카테고리 */}
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={styles.catItem}
                    onClick={() => navigate(`/category/${cat.name}`)}
                  >
                    <div className={styles.catIcon}>{CATEGORY_ICONS[cat.name] ?? "📦"}</div>
                    <span className={styles.catLabel}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={`${styles.section} animate-fade-up-2`}>
              <div className="section-header">
                <h2 className="section-title">주목할 만한 프로젝트</h2>
                <span className="section-link" onClick={() => navigate("/popular")}>전체보기</span>
              </div>
              {popular.length > 0
                ? <div className={styles.grid}>{popular.map(p => <ProjectCard key={p.id} project={p} />)}</div>
                : <div className={styles.emptySection}>등록된 프로젝트가 없습니다.</div>
              }
            </section>

            <section className={`${styles.section} animate-fade-up-3`}>
              <div className="section-header">
                <h2 className="section-title">신규 프로젝트</h2>
                <span className="section-link" onClick={() => navigate("/new")}>전체보기</span>
              </div>
              {newLoading
                ? <div className={styles.emptySection}>로딩 중...</div>
                : newList.length > 0
                  ? <div className={styles.grid}>{newList.map(p => <ProjectCard key={p.id} project={p} />)}</div>
                  : <div className={styles.emptySection}>등록된 프로젝트가 없습니다.</div>
              }
            </section>
          </div>

          <aside className="sticky-aside animate-fade-up-1">
            <div className={`card ${styles.popularCard}`}>
              <div className={styles.popularHead}>
                <div>
                  <h2 className="section-title" style={{ marginBottom: 2 }}>인기 프로젝트</h2>
                  <p className="section-sub">
                    {new Date().toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} 기준
                  </p>
                </div>
                <span className="section-link" onClick={() => navigate("/popular")}>전체보기</span>
              </div>
              {popular.length > 0
                ? popular.map((p, i) => <PopularItem key={p.id} project={p} rank={i + 1} />)
                : <p style={{ fontSize: 13, color: "var(--light)", padding: "12px 0" }}>아직 프로젝트가 없습니다.</p>
              }
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
