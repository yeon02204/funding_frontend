/* ─────────────────────────────────────────
   api/client.js
   axios 공통 인스턴스
   - baseURL 자동 설정
   - 요청마다 JWT 자동 주입
   - 401 응답 시 로그인 페이지 리다이렉트
───────────────────────────────────────── */
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 15_000,
});

/* ── 요청 인터셉터: JWT 자동 첨부 ── */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── 응답 인터셉터: 에러 처리 ── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
