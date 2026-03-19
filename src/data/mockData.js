/* ─────────────────────────────────────────
   data/mockData.js — 정적 데이터 (네비)
   카테고리는 API에서 동적으로 가져옴
───────────────────────────────────────── */

/* 홈 숏컷 탭 (고정) */
export const SHORTCUT_TABS = [
  { icon: "🔥", label: "지금 인기",    path: "/popular" },
  { icon: "✨", label: "신규 프로젝트", path: "/new" },
  { icon: "⏰", label: "마감 임박",    path: "/closing-soon" },
  { icon: "📅", label: "공개 예정",    path: "/upcoming" },
];

/* 헤더 네비게이션 */
export const NAV_LINKS = [
  { label: "홈",          path: "/" },
  { label: "인기 프로젝트", path: "/popular" },
  { label: "신규 프로젝트", path: "/new" },
  { label: "공개 예정",    path: "/upcoming" },
  { label: "마감 임박",    path: "/closing-soon" },
];

/* 목 프로젝트 — 하위 호환용 빈 배열 (실제 데이터는 API에서) */
export const MOCK_PROJECTS = [];