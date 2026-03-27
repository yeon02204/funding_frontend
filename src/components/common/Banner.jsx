/* ─────────────────────────────────────────
   components/common/Banner.jsx
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../api/projects";
import styles from "./Banner.module.css";

const GRADIENTS = [
  "linear-gradient(135deg, #1C1C2E 0%, #2d1f3d 100%)",
  "linear-gradient(135deg, #1a2a3a 0%, #1C1C2E 100%)",
  "linear-gradient(135deg, #2a1a1a 0%, #1C1C2E 100%)",
];

// 배열에서 n개 랜덤 추출
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function Banner() {
  const [slide, setSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [previewImgs, setPreviewImgs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects({ status: "FUNDING", size: 20 })
      .then(res => {
        const projects = res?.content ?? res?.data?.content ?? [];
        if (projects.length === 0) return;

        // 썸네일 있는 프로젝트만 필터
        const withThumb = projects.filter(p => p.thumbnailUrl);

        // 슬라이드용 3개 랜덤 선택
        const slideProjects = pickRandom(withThumb.length > 0 ? withThumb : projects, Math.min(3, projects.length));
        setSlides(slideProjects.map((p, i) => ({
          title: p.title,
          sub: p.ownerNickname ?? "창작자",
          gradient: GRADIENTS[i % GRADIENTS.length],
          projectId: p.id,
          thumbnail: p.thumbnailUrl,
        })));

        // 미리보기 이미지 4개 (슬라이드와 다른 프로젝트에서)
        const others = withThumb.filter(p => !slideProjects.find(s => s.id === p.id));
        const previews = pickRandom(others.length >= 4 ? others : withThumb, Math.min(4, withThumb.length));
        setPreviewImgs(previews.map(p => p.thumbnailUrl));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4200);
    return () => clearInterval(t);
  }, [slides]);

  // 로딩 중이거나 프로젝트 없으면 기본 배너
  if (slides.length === 0) return (
    <div className={styles.wrap}>
      <div className={styles.inner} style={{ background: GRADIENTS[0] }}>
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
      onClick={() => navigate(`/projects/${current.projectId}`)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.inner} style={{ background: current.gradient }}>
        {/* 슬라이드 배경 썸네일 (흐릿하게) */}
        {current.thumbnail && (
          <img
            src={current.thumbnail}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.18,
              zIndex: 0,
            }}
          />
        )}

        {/* Text */}
        <div className={styles.content}>
          <h2 className={styles.title} style={{ whiteSpace: "pre-line" }}>
            {current.title}
          </h2>
          <p className={styles.sub}>{current.sub}</p>
        </div>

        {/* 프로젝트 이미지 카드들 */}
        <div className={styles.books}>
          {previewImgs.map((src, i) => (
            <div key={i} className={`${styles.book} ${styles[`book${i}`]}`}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        {/* Pagination */}
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

        {/* Slide counter */}
        <span className={styles.counter}>{slide + 1} / {slides.length}</span>
      </div>
    </div>
  );
}
