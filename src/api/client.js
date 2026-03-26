/* ─────────────────────────────────────────
   api/client.js
   axios 공통 인스턴스
   - baseURL 자동 설정
   - 요청마다 JWT 자동 주입
   - 401 응답 시 Refresh Token으로 자동 재발급
   - 재발급 실패 시 로그인 페이지 리다이렉트
───────────────────────────────────────── */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  withCredentials: true, // refreshToken 쿠키 자동 전송
});

let isRefreshing = false;
let failedQueue = []; // 재발급 중 실패한 요청들 대기열

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/* ── 요청 인터셉터: JWT 자동 첨부 ── */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── 응답 인터셉터: 401 시 자동 토큰 재발급 ── */
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // 401이 아니거나 이미 재시도한 요청이면 그냥 reject
    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    // refresh 요청 자체가 401 나면 로그아웃
    if (originalRequest.url?.includes("/api/auth/refresh")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    // 이미 재발급 중이면 대기열에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh Token으로 새 AccessToken 발급
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true } // HttpOnly 쿠키 전송
      );

      const newToken = res.data?.data?.accessToken;
      localStorage.setItem("accessToken", newToken);
      client.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;