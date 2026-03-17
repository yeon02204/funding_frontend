/* ─────────────────────────────────────────
   components/common/Banner.jsx
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Banner.module.css";

const SLIDES = [
  {
    title: "꿈과 현실 사이\n아슬아슬 집착 로맨스!",
    sub: "〈꿈에서 자유로〉 단행본 완결권",
    gradient: "linear-gradient(135deg, #1C1C2E 0%, #2d1f3d 100%)",
    projectId: 1,
  },
  {
    title: "나만의 창작물을\n세상에 선보이세요",
    sub: "창작자와 후원자를 잇는 플랫폼",
    gradient: "linear-gradient(135deg, #1a2a3a 0%, #1C1C2E 100%)",
    projectId: 5,
  },
  {
    title: "한정판 굿즈와\n작가의 이야기",
    sub: "지금 바로 후원하고 특별한 경험을",
    gradient: "linear-gradient(135deg, #2a1a1a 0%, #1C1C2E 100%)",
    projectId: 4,
  },
];

const PREVIEW_IMGS = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=70",
  "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=200&q=70",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=70",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200&q=70",
];

export default function Banner() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const current = SLIDES[slide];

  return (
    <div
      className={styles.wrap}
      onClick={() => navigate(`/projects/${current.projectId}`)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.inner} style={{ background: current.gradient }}>
        {/* Text */}
        <div className={styles.content}>
          <h2 className={styles.title} style={{ whiteSpace: "pre-line" }}>
            {current.title}
          </h2>
          <p className={styles.sub}>{current.sub}</p>
        </div>

        {/* Book previews */}
        <div className={styles.books}>
          {PREVIEW_IMGS.map((src, i) => (
            <div key={i} className={`${styles.book} ${styles[`book${i}`]}`}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
              onClick={e => { e.stopPropagation(); setSlide(i); }}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <span className={styles.counter}>{slide + 1} / {SLIDES.length}</span>
      </div>
    </div>
  );
}
