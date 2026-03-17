/* ─────────────────────────────────────────
   api/auth.js
   POST /api/auth/*
───────────────────────────────────────── */
import client from "./client";

/** 회원가입
 *  body: { email, nickname, password }
 *  → ApiResponse<Void>
 */
export const register = (data) =>
  client.post("/api/auth/register", data).then((r) => r.data);

/** 로그인
 *  body: { email, password }
 *  → ApiResponse<{ accessToken }>
 *  성공 시 localStorage에 토큰 저장
 */
export const login = async (data) => {
  const res = await client.post("/api/auth/login", data);
  const token = res.data?.data?.accessToken;
  if (token) localStorage.setItem("accessToken", token);
  return res.data;
};

/** 로그아웃 (클라이언트 측만 처리) */
export const logout = () => localStorage.removeItem("accessToken");

/** 이메일 인증 코드 발송
 *  body: { email }
 */
export const sendVerification = (email) =>
  client.post("/api/auth/email/send", { email }).then((r) => r.data);

/** 이메일 인증 코드 확인
 *  body: { email, code }
 */
export const verifyEmail = (data) =>
  client.post("/api/auth/email/verify", data).then((r) => r.data);

/** 이메일(아이디) 찾기
 *  body: { nickname }
 */
export const findEmail = (nickname) =>
  client.post("/api/auth/find-email", { nickname }).then((r) => r.data);

/** 비밀번호 재설정 이메일 요청
 *  body: { email }
 */
export const requestPasswordReset = (email) =>
  client.post("/api/auth/password/reset-request", { email }).then((r) => r.data);

/** 비밀번호 재설정 실행
 *  body: { token, newPassword }
 */
export const resetPassword = (data) =>
  client.post("/api/auth/password/reset", data).then((r) => r.data);
