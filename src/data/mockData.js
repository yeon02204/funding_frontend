/* ─────────────────────────────────────────
   data/mockData.js — 정적 데이터 (카테고리, 네비)
   프로젝트 목록은 전부 실제 API 사용
───────────────────────────────────────── */

/* 카테고리 — DB와 name 일치시켜야 함 */
export const CATEGORIES = [
  { id: "all",          icon: "⊞",  label: "전체" },
  { id: "보드게임·TRPG",  icon: "🎲",  label: "보드게임·TRPG" },
  { id: "디지털 게임",    icon: "🕹️",  label: "디지털 게임" },
  { id: "웹툰·만화",      icon: "📖",  label: "웹툰·만화" },
  { id: "웹툰 리소스",    icon: "✏️",  label: "웹툰 리소스" },
  { id: "디자인 문구",    icon: "📝",  label: "디자인 문구" },
  { id: "캐릭터·굿즈",    icon: "🧸",  label: "캐릭터·굿즈" },
  { id: "홈·리빙",        icon: "🏠",  label: "홈·리빙" },
  { id: "테크·가전",      icon: "💻",  label: "테크·가전" },
  { id: "개발·프로그래밍", icon: "🖥️",  label: "개발·프로그래밍" },
  { id: "푸드",           icon: "🍽️",  label: "푸드" },
  { id: "향수·뷰티",      icon: "🌸",  label: "향수·뷰티" },
  { id: "의류",           icon: "👗",  label: "의류" },
  { id: "잡화",           icon: "👜",  label: "잡화" },
  { id: "주얼리",         icon: "💎",  label: "주얼리" },
  { id: "반려동물",        icon: "🐾",  label: "반려동물" },
  { id: "출판",           icon: "📚",  label: "출판" },
  { id: "디자인",         icon: "🎨",  label: "디자인" },
  { id: "예술",           icon: "🖼️",  label: "예술" },
  { id: "사진",           icon: "📷",  label: "사진" },
  { id: "음악",           icon: "🎵",  label: "음악" },
  { id: "공연",           icon: "🎭",  label: "공연" },
  { id: "영화·비디오",    icon: "🎬",  label: "영화·비디오" },
];

/* 홈 숏컷 탭 */
export const SHORTCUT_TABS = [
  { icon: "🔥", label: "지금 인기",    path: "/popular" },
  { icon: "✨", label: "신규 프로젝트", path: "/new" },
  { icon: "⏰", label: "마감 임박",    path: "/closing-soon" },
  { icon: "📅", label: "공개 예정",    path: "/upcoming" },
  { icon: "🕹️", label: "디지털 게임",  path: "/category/디지털 게임" },
  { icon: "🖥️", label: "개발",         path: "/category/개발·프로그래밍" },
  { icon: "📖", label: "웹툰·만화",    path: "/category/웹툰·만화" },
  { icon: "🎵", label: "음악",         path: "/category/음악" },
  { icon: "🖼️", label: "예술",         path: "/category/예술" },
  { icon: "📚", label: "출판",         path: "/category/출판" },
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