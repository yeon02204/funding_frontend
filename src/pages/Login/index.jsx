/* ─────────────────────────────────────────
   pages/Login/index.jsx
   탭: login | register | verify | find-email | find-password | reset-password
───────────────────────────────────────── */
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  login, register,
  sendVerification, verifyEmail,
  findEmail,
  requestPasswordReset, resetPassword,
} from "../../api/auth";
import { getMe } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import styles from "./Login.module.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function Login() {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const { loginSuccess }  = useAuth();

  // /reset-password?token=xxx 또는 /login?token=xxx 둘 다 처리
  const urlToken = searchParams.get("token");
  const isResetPath = window.location.pathname.includes("reset-password");
  const [tab, setTab] = useState(urlToken || isResetPath ? "reset-password" : "login");

  const [form,    setForm]    = useState({
    email: "", password: "", nickname: "",
    code: "",
    resetToken: urlToken ?? "", newPassword: "", newPasswordConfirm: "",
    findNickname: "",
  });
  const [msg,     setMsg]     = useState({ text: "", type: "" }); // type: error | success
  const [loading, setLoading] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0); // 초 단위 남은 시간 (표시용)

  const handle = (e) => {
    setMsg({ text: "", type: "" });
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const showMsg = (text, type = "error") => setMsg({ text, type });

  const goTab = (t) => { setTab(t); setMsg({ text: "", type: "" }); };

  /* ── 소셜 로그인 ── */
  const handleSocial = (provider) => {
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
  };

  /* ── 로그인 ── */
  const handleLogin = async () => {
    await login({ email: form.email, password: form.password });
    const me = await getMe();
    loginSuccess(me);
    navigate("/");
  };

  /* ── 회원가입 → 인증 코드 발송 ── */
  const handleRegister = async () => {
    if (form.password.length < 8) { showMsg("비밀번호는 8자 이상이어야 합니다."); return; }
    try {
      await register({ email: form.email, password: form.password, nickname: form.nickname });
      showMsg("회원가입이 완료되었습니다! 로그인해주세요.", "success");
      goTab("login");
    } catch (e) {
      const msg = e.response?.data?.message ?? "";
      if (e.response?.status === 409 && msg.includes("이메일")) {
    showMsg("이미 사용 중인 이메일입니다.", "error");
    return;
}
      showMsg(msg || "회원가입 실패");
      return;
    }
  };

  /* ── 이메일 인증 코드 확인 ── */
  const handleVerify = async () => {
    if (form.code.length !== 6) { showMsg("6자리 코드를 입력해주세요."); return; }
    await verifyEmail({ email: form.email, code: form.code });
    showMsg("이메일 인증이 완료됐어요! 로그인해주세요.", "success");
    goTab("login");
  };

  /* ── 코드 재발송 ── */
  const handleResend = async () => {
    setLoading(true);
    try {
      await sendVerification(form.email);
      showMsg("코드를 재발송했습니다.", "success");
    } catch (e) {
      showMsg(e.response?.data?.message ?? "재발송 실패");
    } finally {
      setLoading(false);
    }
  };

  /* ── 아이디(이메일) 찾기 ── */
  const handleFindEmail = async () => {
    const res = await findEmail(form.findNickname);
    const email = res?.data?.email ?? res?.email ?? "—";
    showMsg(`가입된 이메일: ${email}`, "success");
  };

  /* ── 비밀번호 재설정 요청 ── */
  const handlePasswordResetRequest = async () => {
    await requestPasswordReset(form.email);
    showMsg("비밀번호 재설정 링크를 이메일로 발송했습니다.", "success");
  };

  /* ── 비밀번호 재설정 실행 ── */
  const handleResetPassword = async () => {
    if (form.newPassword !== form.newPasswordConfirm) {
      showMsg("비밀번호가 일치하지 않습니다."); return;
    }
    if (form.newPassword.length < 8) {
      showMsg("비밀번호는 8자 이상이어야 합니다."); return;
    }
    await resetPassword({ token: form.resetToken, newPassword: form.newPassword });
    showMsg("비밀번호가 변경됐어요! 로그인해주세요.", "success");
    goTab("login");
  };

  /* ── 공통 submit 래퍼 ── */
  const submit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    setLoading(true);
    try {
      if (tab === "login")           await handleLogin();
      if (tab === "register")        await handleRegister();
      if (tab === "verify")          await handleVerify();
      if (tab === "find-email")      await handleFindEmail();
      if (tab === "find-password")   await handlePasswordResetRequest();
      if (tab === "reset-password")  await handleResetPassword();
    } catch (err) {
      showMsg(err.response?.data?.message ?? "오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  /* ── 탭별 제목 / 버튼 텍스트 ── */
  const META = {
    "login":          { title: null,              btn: "로그인" },
    "register":       { title: null,              btn: "회원가입" },
    "verify":         { title: "이메일 인증",      btn: "인증 확인" },
    "find-email":     { title: "아이디 찾기",      btn: "이메일 찾기" },
    "find-password":  { title: "비밀번호 찾기",    btn: "재설정 링크 보내기" },
    "reset-password": { title: "비밀번호 재설정",  btn: "비밀번호 변경" },
  };
  const meta = META[tab];

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <Link to="/" className={styles.logo}>Fundit</Link>
        <p className={styles.tagline}>창작자와 후원자를 잇는 공간</p>

        {/* ── 소셜 로그인 (login/register 탭만) ── */}
        {(tab === "login" || tab === "register") && (
          <>
            <div className={styles.social}>
              <button className={`${styles.socialBtn} ${styles.kakao}`} onClick={() => handleSocial("kakao")}>
                <span className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.556 5.08 3.926 6.56L4.9 21l4.434-2.37A11.1 11.1 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                  </svg>
                </span>
                카카오로 계속하기
              </button>
              <button className={`${styles.socialBtn} ${styles.naver}`} onClick={() => handleSocial("naver")}>
                <span className={`${styles.socialIcon} ${styles.naverIcon}`}>N</span>
                네이버로 계속하기
              </button>
            </div>
            <div className={styles.divider}><span>또는 이메일로 계속하기</span></div>
            <div className={styles.toggle}>
              <button className={`${styles.toggleBtn} ${tab === "login"    ? styles.toggleActive : ""}`} onClick={() => goTab("login")}>로그인</button>
              <button className={`${styles.toggleBtn} ${tab === "register" ? styles.toggleActive : ""}`} onClick={() => goTab("register")}>회원가입</button>
            </div>
          </>
        )}

        {/* ── 서브 탭 제목 (verify 이후) ── */}
        {meta.title && (
          <div className={styles.subHeader}>
            {tab !== "verify" && (
              <button className={styles.backBtn} onClick={() => goTab("login")}>← 돌아가기</button>
            )}
            <h2 className={styles.subTitle}>{meta.title}</h2>
          </div>
        )}

        {/* ── 폼 ── */}
        <form className={styles.form} onSubmit={submit}>

          {/* 회원가입 */}
          {tab === "register" && (
            <div className={styles.field}>
              <label>닉네임</label>
              <input name="nickname" value={form.nickname} onChange={handle} placeholder="닉네임을 입력하세요" required />
            </div>
          )}

          {/* 이메일 입력 (login / register / find-password) */}
          {(tab === "login" || tab === "register" || tab === "find-password") && (
            <div className={styles.field}>
              <label>이메일</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="이메일을 입력하세요" required />
            </div>
          )}

          {/* 비밀번호 (login / register) */}
          {(tab === "login" || tab === "register") && (
            <div className={styles.field}>
              <label>비밀번호{tab === "register" && <span className={styles.hint}> (8자 이상)</span>}</label>
              <input name="password" type="password" value={form.password} onChange={handle} placeholder="비밀번호를 입력하세요" required minLength={tab === "register" ? 8 : undefined} />
            </div>
          )}

          {/* 이메일 인증 코드 */}
          {tab === "verify" && (
            <>
              <p className={styles.verifyDesc}>
                <strong>{form.email}</strong>로 발송된 6자리 코드를 입력해주세요.
              </p>
              <div className={styles.codeRow}>
                <input
                  className={styles.codeInput}
                  name="code" value={form.code} onChange={handle}
                  placeholder="000000" maxLength={6}
                  inputMode="numeric" autoFocus required
                />
                <button type="button" className={styles.resendBtn} onClick={handleResend} disabled={loading}>
                  재발송
                </button>
              </div>
            </>
          )}

          {/* 아이디 찾기 */}
          {tab === "find-email" && (
            <div className={styles.field}>
              <label>닉네임</label>
              <input name="findNickname" value={form.findNickname} onChange={handle} placeholder="가입 시 사용한 닉네임을 입력하세요" required />
            </div>
          )}

          {/* 비밀번호 재설정 (토큰 + 새 비밀번호) */}
          {tab === "reset-password" && (
            <>
              <div className={styles.field}>
                <label>새 비밀번호 <span className={styles.hint}>(8자 이상)</span></label>
                <input name="newPassword" type="password" value={form.newPassword} onChange={handle} placeholder="새 비밀번호" required minLength={8} />
              </div>
              <div className={styles.field}>
                <label>비밀번호 확인</label>
                <input name="newPasswordConfirm" type="password" value={form.newPasswordConfirm} onChange={handle} placeholder="비밀번호 확인" required />
              </div>
            </>
          )}

          {/* 메시지 */}
          {msg.text && (
            <p className={msg.type === "success" ? styles.successMsg : styles.errorMsg}>
              {msg.text}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} style={{ marginTop: 8 }}>
            {meta.btn}
          </Button>
        </form>

        {/* ── 하단 링크 ── */}
        {(tab === "login") && (
          <div className={styles.bottomLinks}>
            <button className={styles.textBtn} onClick={() => goTab("find-email")}>아이디 찾기</button>
            <span className={styles.dot}>·</span>
            <button className={styles.textBtn} onClick={() => goTab("find-password")}>비밀번호 찾기</button>
          </div>
        )}
      </div>
    </div>
  );
}
