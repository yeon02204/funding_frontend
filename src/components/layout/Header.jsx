/* ─────────────────────────────────────────
   components/layout/Header.jsx
───────────────────────────────────────── */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { NAV_LINKS } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

export default function Header() {
  const navigate          = useNavigate();
  const [query, setQuery] = useState("");
  const { user, logout }  = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 프로젝트 올리기 — 비로그인이면 로그인 페이지로
  const handleCreateProject = () => {
    if (!user) { navigate("/login"); return; }
    navigate("/project/new");
  };

  return (
    <header className={styles.header}>
      {/* ── Top Row ── */}
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
          <button className={styles.actionBtn} onClick={handleCreateProject}>
            프로젝트 올리기
          </button>
          <span className={styles.divider}>|</span>

          {user ? (
            /* ── 로그인 상태 ── */
            <>
              <span className={styles.nickname}>{user.nickname}님</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                로그아웃
              </button>
              <Link to="/mypage" className={styles.creatorBtn}>마이페이지</Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" className={styles.adminBtn}>관리자</Link>
              )}
            </>
          ) : (
            /* ── 비로그인 상태 — 창작자센터 숨김 ── */
            <>
              <Link to="/login" className={styles.loginBtn}>로그인/회원가입</Link>
            </>
          )}
        </div>
      </div>

      {/* ── Nav Row ── */}
      <nav className={styles.nav}>
        {NAV_LINKS.map(({ label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
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
