/* ─────────────────────────────────────────
   hooks/useAuth.js
   로그인 상태 + 로그인/로그아웃 액션
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { getMe } from "../api/users";
import { logout as apiLogout } from "../api/auth";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    getMe()
      .then(setUser)
      .catch(() => { localStorage.removeItem("accessToken"); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    apiLogout();
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, isLoggedIn, logout };
}
