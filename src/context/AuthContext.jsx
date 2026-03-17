/* ─────────────────────────────────────────
   context/AuthContext.jsx
   앱 전체 로그인 상태 관리
   - useAuth() 훅으로 어디서든 사용 가능
───────────────────────────────────────── */
import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/users";
import { logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // UserProfileResponse
  const [loading, setLoading] = useState(true);   // 초기 로딩

  /* 앱 시작 시 토큰 있으면 내 정보 불러오기 */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }

    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("accessToken"))
      .finally(() => setLoading(false));
  }, []);

  /* 로그인 성공 후 호출 — 토큰은 api/auth.js 에서 이미 저장됨 */
  const loginSuccess = (userData) => setUser(userData);

  /* 로그아웃 */
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* 어디서든 useAuth() 로 꺼내 쓰기 */
export function useAuth() {
  return useContext(AuthContext);
}
