/* ─────────────────────────────────────────
   pages/Home/index.jsx — 실제 API 연동
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner      from "../../components/common/Banner";
import ProjectCard from "../../components/common/ProjectCard";
import PopularItem from "../../components/common/PopularItem";
import { useProjects } from "../../hooks/useProjects";
import styles from "./Home.module.css";


export default function Home() {
  const [notice, setNotice] = useState(true);
  const navigate = useNavigate();


  const { data: popularData } = useProjects({ status: "FUNDING", sortBy: "likes", size: 6 });
  const { data: newData, loading: newLoading } = useProjects({ status: "FUNDING", size: 9 });

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
