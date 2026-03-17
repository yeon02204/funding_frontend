/* ─────────────────────────────────────────
   utils/format.js  — 공통 포매팅 유틸
───────────────────────────────────────── */

/** 금액 → 한국식 표기 (14,072,400 → "1,407만 원+") */
export function fmtAmount(n) {
  if (n >= 1_000_000_00) return `${(n / 1_000_000_00).toFixed(1)}억 원+`;
  if (n >= 10_000)       return `${Math.floor(n / 10_000).toLocaleString()}만 원+`;
  return `${n.toLocaleString()}원`;
}

/** 목표 대비 달성률 (%) */
export function calcPct(current, goal) {
  if (!goal) return 0;
  return Math.round((current / goal) * 100);
}

/** 숫자 → 천 단위 콤마 */
export function fmtNumber(n) {
  return (n ?? 0).toLocaleString();
}

/** Date → "2026.03.06" 형식 */
export function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return dateStr;
}

/** n일 → "n일 남음" / "마감" */
export function fmtDaysLeft(days) {
  if (days <= 0) return "마감";
  if (days === 1) return "오늘 마감";
  return `${days}일 남음`;
}

/** 클래스 조합 헬퍼 (falsy 값 제거) */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
