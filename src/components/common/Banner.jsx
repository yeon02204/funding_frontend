/* ─────────────────────────────────────────
   components/common/Banner.jsx
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../api/projects";
import styles from "./Banner.module.css";

export default function Banner() {
  const [slide, setSlide]   = useState(0);
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects({ status: "FUNDING", size: 20 })
      .then(res => {
        const projects = res?.content ?? res?.data?.content ?? [];
        const withThumb = projects.filter(p => p.thumbnailUrl);
        const pool = withThumb.length > 0 ? withThumb : projects;
        const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
        setSlides(picked);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4200);
    return () => clearInterval(t);
  }, [slides]);

  if (slides.length === 0) return (
    <div className={styles.wrap}>
      <div className={styles.inner} style={{ background: "linear-gradient(135deg, #1C1C2E 0%, #2d1f3d 100%)" }}>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h2 className={styles.title}>나만의 창작물을{"\n"}세상에 선보이세요</h2>
          <p className={styles.sub}>창작자와 후원자를 잇는 플랫폼</p>
        </div>
      </div>
    </div>
  );

  const current = slides[slide];

  return (
    <div
      className={styles.wrap}
      onClick={() => navigate(`/projects/${current.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.inner}>
        {current.thumbnailUrl && (
          <img
            key={current.id}
            src={current.thumbnailUrl}
            alt=""
            className={styles.bgImg}
          />
        )}
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h2 className={styles.title} style={{ whiteSpace: "pre-line" }}>
            {current.title}
          </h2>
          <p className={styles.sub}>{current.ownerNickname ?? "창작자"}</p>
        </div>
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
              onClick={e => { e.stopPropagation(); setSlide(i); }}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
        <span className={styles.counter}>{slide + 1} / {slides.length}</span>
      </div>
    </div>
  );
}
