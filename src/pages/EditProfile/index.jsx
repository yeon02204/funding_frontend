/* ─────────────────────────────────────────
   pages/EditProfile/index.jsx — 프로필 수정
   PUT  /api/users/me          — 닉네임 수정
   PUT  /api/users/me/password — 비밀번호 변경
   DELETE /api/users/me        — 회원 탈퇴
───────────────────────────────────────── */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, withdraw } from "../../api/users";
import client from "../../api/client";
import styles from "./EditProfile.module.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* ── 닉네임 수정 ── */
  const [nickname,      setNickname]      = useState(user?.nickname ?? "");
  const [nickSaving,    setNickSaving]    = useState(false);
  const [nickMsg,       setNickMsg]       = useState("");

  /* ── 비밀번호 변경 ── */
  const [pwForm,   setPwForm]   = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState("");

  /* ── 탈퇴 ── */
  const [withdrawing, setWithdrawing] = useState(false);

  /* ── 닉네임 저장 ── */
  const handleNicknameSave = async () => {
    if (!nickname.trim() || nickname.trim().length < 2) {
      setNickMsg("닉네임은 2자 이상이어야 합니다."); return;
    }
    setNickSaving(true); setNickMsg("");
    try {
      await updateProfile({ nickname: nickname.trim() });
      setNickMsg("✅ 닉네임이 변경되었습니다. 다시 로그인하면 반영됩니다.");
    } catch (e) {
      setNickMsg("❌ " + (e.response?.data?.message ?? "변경 실패"));
    } finally {
      setNickSaving(false);
    }
  };

  /* ── 비밀번호 변경 ── */
  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMsg("모든 항목을 입력해주세요."); return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg("새 비밀번호는 8자 이상이어야 합니다."); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg("새 비밀번호가 일치하지 않습니다."); return;
    }
    setPwSaving(true); setPwMsg("");
    try {
      await client.put("/api/users/me/password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwMsg("✅ 비밀번호가 변경되었습니다.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwMsg("❌ " + (e.response?.data?.message ?? "변경 실패"));
    } finally {
      setPwSaving(false);
    }
  };

  /* ── 회원 탈퇴 ── */
  const handleWithdraw = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?\n탈퇴 후에는 계정을 복구할 수 없습니다.")) return;
    setWithdrawing(true);
    try {
      await withdraw();
      alert("탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
      logout();
      navigate("/");
    } catch (e) {
      alert(e.response?.data?.message ?? "탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="page-wrap animate-fade-up" style={{ maxWidth: 560, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/mypage")}
        style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 24, color: "var(--coral)", fontSize: 14 }}
      >
        ← 마이페이지로
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>프로필 편집</h1>

      {/* ── 닉네임 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>닉네임 변경</h2>
        <input
          className={styles.input}
          value={nickname}
          maxLength={20}
          onChange={e => setNickname(e.target.value)}
          placeholder="닉네임 (2~20자)"
        />
        {nickMsg && <p className={styles.msg}>{nickMsg}</p>}
        <button
          className={styles.saveBtn}
          onClick={handleNicknameSave}
          disabled={nickSaving}
        >
          {nickSaving ? "저장 중..." : "저장"}
        </button>
      </section>

      {/* ── 비밀번호 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>비밀번호 변경</h2>
        {[
          { label: "현재 비밀번호", key: "current" },
          { label: "새 비밀번호 (8자 이상)", key: "next" },
          { label: "새 비밀번호 확인", key: "confirm" },
        ].map(({ label, key }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label className={styles.label}>{label}</label>
            <input
              className={styles.input}
              type="password"
              value={pwForm[key]}
              onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        {pwMsg && <p className={styles.msg}>{pwMsg}</p>}
        <button
          className={styles.saveBtn}
          onClick={handlePasswordChange}
          disabled={pwSaving}
        >
          {pwSaving ? "변경 중..." : "비밀번호 변경"}
        </button>
      </section>

      {/* ── 탈퇴 ── */}
      <section className={styles.section} style={{ borderTop: "1px solid #eee", paddingTop: 24, marginTop: 8 }}>
        <h2 className={styles.sectionTitle} style={{ color: "#dc3545" }}>회원 탈퇴</h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          탈퇴 시 계정 정보가 삭제되며 복구할 수 없습니다.
        </p>
        <button
          className={styles.withdrawBtn}
          onClick={handleWithdraw}
          disabled={withdrawing}
        >
          {withdrawing ? "처리 중..." : "탈퇴하기"}
        </button>
      </section>
    </div>
  );
}
