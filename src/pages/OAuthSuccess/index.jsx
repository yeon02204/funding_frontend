/* ─────────────────────────────────────────
   pages/OAuthSuccess/index.jsx
   소셜 로그인 성공 후 리다이렉트되는 페이지
   
   서버 → http://localhost:5173/oauth/success#accessToken=xxx
   
   처리 흐름:
   1. URL hash에서 accessToken 추출
   2. localStorage에 저장
   3. /api/users/me 로 내 정보 불러오기
   4. AuthContext에 유저 등록
   5. 홈으로 이동
   
   실패 시:
   서버가 http://localhost:5173/oauth/success#message=에러메시지
───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../api/users";
import { useAuth } from "../../context/AuthContext";

export default function OAuthSuccess() {
  const navigate         = useNavigate();
  const { loginSuccess } = useAuth();
  const [status, setStatus] = useState("processing"); // processing | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const hash = window.location.hash; // "#accessToken=xxx" or "#message=에러"

    if (!hash) {
      setStatus("error");
      setErrorMsg("인증 정보가 없습니다.");
      return;
    }

    // hash 파싱 — "#key=value" 형태
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("accessToken");
    const message     = params.get("message");

    // 실패 케이스
    if (!accessToken) {
      setStatus("error");
      setErrorMsg(message ?? "소셜 로그인에 실패했습니다.");
      return;
    }

    // 성공 — 토큰 저장 후 내 정보 불러오기
    localStorage.setItem("accessToken", accessToken);

    getMe()
      .then((user) => {
        loginSuccess(user);
        navigate("/", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setStatus("error");
        setErrorMsg("사용자 정보를 불러오는데 실패했습니다.");
      });
  }, []);

  if (status === "error") {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "var(--font-sans)",
      }}>
        <p style={{ fontSize: "40px" }}>😢</p>
        <p style={{ fontSize: "16px", color: "var(--charcoal)", fontWeight: 600 }}>
          로그인에 실패했습니다
        </p>
        <p style={{ fontSize: "14px", color: "var(--light)" }}>{errorMsg}</p>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "8px",
            padding: "10px 28px",
            background: "var(--coral)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-pill)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          다시 로그인
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--coral)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: "14px", color: "var(--light)" }}>로그인 처리 중...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
