/* ─────────────────────────────────────────
   components/layout/Header.jsx
───────────────────────────────────────── */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { NAV_LINKS } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../api/categories";
import styles from "./Header.module.css";

const CATEGORY_ICONS = {
  "보드게임·TRPG": "🎲", "디지털 게임": "🕹️", "웹툰·만화": "📖",
  "웹툰 리소스": "✏️", "디자인 문구": "📝", "캐릭터·굿즈": "🧸",
  "홈·리빙": "🏠", "테크·가전": "💻", "개발·프로그래밍": "🖥️",
  "푸드": "🍽️", "향수·뷰티": "🌸", "의류": "👗", "잡화": "👜",
  "주얼리": "💎", "반려동물": "🐾", "출판": "📚", "디자인": "🎨",
  "예술": "🖼️", "사진": "📷", "음악": "🎵", "공연": "🎭", "영화·비디오": "🎬",
};

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const closeTimer = useRef(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setCatOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setCatOpen(false), 150);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const handleCreateProject = () => {
    if (!user) { navigate("/login"); return; }
    navigate("/project/new");
  };

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <Link to="/" className={styles.logo}>Fundit</Link>

        <form className={styles.searchWrap} onSubmit={handleSearch}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="text"
            placeholder="검색어를 입력해주세요"
            className={styles.searchInput}
          />
        </form>

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleCreateProject}>프로젝트 올리기</button>
          <span className={styles.divider}>|</span>
          {user ? (
            <>
              <span className={styles.nickname}>{user.nickname}님</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
              <Link to="/mypage" className={styles.creatorBtn}>마이페이지</Link>
              {user.role === "ADMIN" && <Link to="/admin" className={styles.adminBtn}>관리자</Link>}
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>로그인/회원가입</Link>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {/* 카테고리 드롭다운 */}
        <div
          className={styles.catWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className={`${styles.navItem} ${styles.catBtn} ${catOpen ? styles.catBtnActive : ""}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            카테고리
          </button>

          {catOpen && (
            <div className={styles.catDropdown}>
              <div className={styles.catGrid}>
                <button
                  className={styles.catDropItem}
                  onClick={() => { navigate("/search"); setCatOpen(false); }}
                >
                  <span className={styles.catDropIcon}>⊞</span>
                  <span className={styles.catDropLabel}>전체</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={styles.catDropItem}
                    onClick={() => { navigate(`/category/${cat.name}`); setCatOpen(false); }}
                  >
                    <span className={styles.catDropIcon}>{CATEGORY_ICONS[cat.name] ?? "📦"}</span>
                    <span className={styles.catDropLabel}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {NAV_LINKS.map(({ label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `${styles.navItem} ${isActive && !catOpen ? styles.active : ""}`}
            end={path === "/"}
          >
            {badge && <span className={styles.navDot} />}
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
