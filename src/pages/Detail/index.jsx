/* ─────────────────────────────────────────
   pages/Detail/index.jsx — 실제 API 연동
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject } from "../../hooks/useProjects";
import { fmtAmount, fmtNumber } from "../../utils/format";
import { Tabs, TabPanel } from "../../components/ui/Tabs";
import { donate } from "../../api/donations";
import { likeProject, unlikeProject, requestReview, requestDelete, deleteRejectedProject, getProjectTags, updateProject } from "../../api/projects";
import { followUser, unfollowUser, isFollowing } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import styles from "./Detail.module.css";

const DETAIL_TABS = ["소개", "리워드", "커뮤니티", "후원자"];

export default function Detail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, loading, error } = useProject(id);

  const [activeTab,  setActiveTab]  = useState("소개");
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(null);
  const [following,  setFollowing]  = useState(false);
  const [donating,   setDonating]   = useState(false);
  const [donateAmt,  setDonateAmt]  = useState("");
  const [showDonate, setShowDonate] = useState(false);
  const [tags,       setTags]       = useState([]);
  const [reviewing,  setReviewing]  = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // 태그 + 좋아요 여부 + 팔로우 여부 로드
  useEffect(() => {
    if (!project) return;

    // 태그
    getProjectTags(id)
      .then((res) => setTags(res?.data ?? res ?? []))
      .catch(() => {});

    if (!user) return;

    // 좋아요 여부 — GET /api/projects/{id}/likes/me
    import("../../api/projects").then(({ isLiked }) => {
      isLiked(id)
        .then((res) => setLiked(res?.data ?? res ?? false))
        .catch(() => {});
    });

    // 팔로우 여부 (창작자 userId가 있어야 함)
    if (project.ownerId) {
      isFollowing(project.ownerId)
        .then((res) => setFollowing(res?.data ?? res ?? false))
        .catch(() => {});
    }
  }, [project, user]);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error || !project)
    return <div className={styles.loading}>프로젝트를 찾을 수 없습니다. <Link to="/">홈으로</Link></div>;

  const pct     = project.progressPercent ?? 0;
  const current = project.currentAmount   ?? 0;
  const goal    = project.goalAmount      ?? 0;
  const likes   = likeCount ?? project.likeCount ?? 0;

  const daysLeft = project.deadline
    ? Math.max(0, Math.ceil((new Date(project.deadline) - Date.now()) / 86400000))
    : null;

  const fmtDate = (s) => s ? s.replace("T", " ").slice(0, 16) : "—";

  // 내 프로젝트 여부
  const isOwner = user && project.ownerNickname === user.nickname;

  /* ── 좋아요 ── */
  const handleLike = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (liked) { await unlikeProject(id); setLikeCount(c => (c ?? likes) - 1); }
      else        { await likeProject(id);  setLikeCount(c => (c ?? likes) + 1); }
      setLiked(l => !l);
    } catch {}
  };

  /* ── 팔로우 ── */
  const handleFollow = async () => {
    if (!user) { navigate("/login"); return; }
    if (!project.ownerId) return;
    try {
      if (following) { await unfollowUser(project.ownerId); }
      else           { await followUser(project.ownerId); }
      setFollowing(f => !f);
    } catch {}
  };

  /* ── 후원 ── */
  const handleDonate = async () => {
    if (!user) { navigate("/login"); return; }
    const amt = Number(donateAmt);
    if (!amt || amt < 1000) { alert("최소 1,000원 이상 입력해주세요."); return; }
    setDonating(true);
    try {
      await donate(id, amt);
      alert("후원이 완료되었습니다! 감사합니다 🎉");
      setShowDonate(false);
      setDonateAmt("");
      window.location.reload();  // 금액 & 달성률 즉시 반영
    } catch (e) {
      alert(e.response?.data?.message ?? "후원 중 오류가 발생했습니다.");
    } finally {
      setDonating(false);
    }
  };

  /* ── 수정 ── */
  const handleEdit = () => {
    setEditForm({
      title:      project.title      ?? "",
      goalAmount: project.goalAmount ?? "",
      startAt:    project.startAt    ? project.startAt.slice(0, 16) : "",
      deadline:   project.deadline   ? project.deadline.slice(0, 16) : "",
      categoryId: project.categoryId ?? "",
    });
    setEditing(true);
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      await updateProject(id, {
        ...editForm,
        goalAmount: Number(editForm.goalAmount),
        startAt:    editForm.startAt  + ":00",
        deadline:   editForm.deadline + ":00",
        content:    project.content ?? "",
      });
      alert("수정이 완료되었습니다.");
      setEditing(false);
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setEditSaving(false);
    }
  };

  /* ── 심사 요청 ── */
  const handleReviewRequest = async () => {
    if (!window.confirm("심사를 요청하시겠습니까?")) return;
    setReviewing(true);
    try {
      await requestReview(id);
      alert("심사 요청이 완료되었습니다. 검토 후 승인됩니다.");
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.message ?? "심사 요청에 실패했습니다.");
    } finally {
      setReviewing(false);
    }
  };

  /* ── 삭제 요청 ── */
  const handleDeleteRequest = async () => {
    if (!window.confirm("삭제를 요청하시겠습니까? 관리자 승인 후 삭제됩니다.")) return;
    try {
      await requestDelete(id);
      alert("삭제 요청이 완료되었습니다.");
      navigate("/mypage");
    } catch (e) {
      alert(e.response?.data?.message ?? "삭제 요청에 실패했습니다.");
    }
  };

  /* ── 반려된 프로젝트 즉시 삭제 ── */
  const handleDeleteRejected = async () => {
    if (!window.confirm("반려된 프로젝트를 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    try {
      await deleteRejectedProject(id);
      alert("프로젝트가 삭제되었습니다.");
      navigate("/mypage");
    } catch (e) {
      alert(e.response?.data?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  /* ── 상태 한글 ── */
  const statusLabel = {
    DRAFT:            "초안",
    REVIEW_REQUESTED: "심사 중",
    APPROVED:         "승인됨",
    REJECTED:         "반려됨",
    FUNDING:          "펀딩 중",
    SUCCESS:          "펀딩 성공",
    FAILED:           "펀딩 실패",
    STOPPED:          "운영 중단",
    DELETE_REQUESTED: "삭제 요청 중",
    DELETED:          "삭제됨",
  }[project.status] ?? project.status;

  return (
    <div className="page-wrap animate-fade-up">
      <nav className={styles.breadcrumb}>
        <Link to="/">홈</Link>
        <span>›</span>
        <span>{project.categoryName ?? "전체"}</span>
        <span>›</span>
        <span className={styles.breadcrumbCurrent}>{project.title}</span>
      </nav>

      <div className="two-col">
        {/* ── Left ── */}
        <div>
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              {project.thumbnailUrl
                ? <img src={project.thumbnailUrl} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                : (
                  <div className={styles.imgPlaceholder}>
                    <span>📦</span>
                    <p>{project.title}</p>
                  </div>
                )
              }
            </div>
            {/* 추가 이미지 썸네일 목록 */}
            {project.imageUrls?.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {project.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`이미지 ${i + 1}`}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: url === project.thumbnailUrl ? "2px solid var(--coral)" : "2px solid transparent" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.tabSection}>
            <Tabs tabs={DETAIL_TABS} active={activeTab} onChange={setActiveTab} />

            <TabPanel active={activeTab} value="소개">
              {/* 태그 */}
              {tags.length > 0 && (
                <div className={styles.tags}>
                  {tags.map((t, i) => (
                    <span key={i} className={styles.tag}>
                      #{typeof t === "string" ? t : t.name}
                    </span>
                  ))}
                </div>
              )}
              {project.content
                ? <div className={styles.content} dangerouslySetInnerHTML={{ __html: project.content }} />
                : <div className="empty-state"><p>소개 내용이 없습니다.</p></div>
              }
            </TabPanel>

            <TabPanel active={activeTab} value="리워드">
              <div className="empty-state"><div className="icon">🎁</div><p>등록된 리워드가 없습니다.</p></div>
            </TabPanel>
            <TabPanel active={activeTab} value="커뮤니티">
              <div className="empty-state"><div className="icon">💬</div><p>아직 커뮤니티 글이 없습니다.</p></div>
            </TabPanel>
            <TabPanel active={activeTab} value="후원자">
              <div className="empty-state"><div className="icon">🙌</div><p>후원자 목록을 불러오는 중입니다.</p></div>
            </TabPanel>
          </div>
        </div>

        {/* ── Right ── */}
        <aside className="sticky-aside">
          <div className={styles.infoBox}>
            {/* 창작자 + 팔로우 */}
            <div className={styles.creatorRow}>
              <p className={styles.creatorTag} onClick={() => project.ownerId && navigate(`/users/${project.ownerId}`)} style={{ cursor: project.ownerId ? "pointer" : "default" }}>{project.ownerNickname ?? "창작자"} ›</p>
              {user && !isOwner && (
                <button
                  className={`${styles.followBtn} ${following ? styles.following : ""}`}
                  onClick={handleFollow}
                >
                  {following ? "팔로잉" : "+ 팔로우"}
                </button>
              )}
            </div>

            <h1 className={styles.title}>{project.title}</h1>

            {/* 상태 배지 */}
            <span className={`${styles.statusBadge} ${styles[project.status?.toLowerCase()]}`}>
              {statusLabel}
            </span>

            {/* 금액 */}
            <div className={styles.amounts}>
              <span className={styles.amount}>{fmtNumber(current)}원</span>
            </div>

            <div className="progress-bar" style={{ height: 5, margin: "0 0 16px" }}>
              <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCell}>
                <p className={styles.statLabel}>달성률</p>
                <p className={`${styles.statVal} coral`}>{pct}%</p>
              </div>
              <div className={styles.statCell}>
                <p className={styles.statLabel}>남은 기간</p>
                <p className={styles.statVal}>{daysLeft !== null ? `${daysLeft}일` : "—"}</p>
              </div>
              <div className={styles.statCell}>
                <p className={styles.statLabel}>좋아요</p>
                <p className={styles.statVal}>{fmtNumber(likes)}</p>
              </div>
            </div>

            <dl className={styles.metaGrid}>
              <dt>카테고리</dt><dd>{project.categoryName ?? "—"}</dd>
              <dt>목표금액</dt><dd>{fmtNumber(goal)}원</dd>
              <dt>시작일</dt>  <dd>{fmtDate(project.startAt)}</dd>
              <dt>마감일</dt>  <dd>{fmtDate(project.deadline)}</dd>
            </dl>

            {/* ── 내 프로젝트 관리 버튼 ── */}
            {isOwner && (
              <div className={styles.ownerActions}>
                {/* DRAFT: 수정 + 심사요청 + 삭제요청 */}
                {project.status === "DRAFT" && (
                  <>
                    <Button fullWidth variant="outline-coral" size="sm"
                      onClick={() => navigate(`/projects/${id}/edit`)}>
                      수정하기
                    </Button>
                    <Button fullWidth variant="outline-coral" size="sm"
                      onClick={handleReviewRequest} disabled={reviewing}>
                      {reviewing ? "요청 중..." : "심사 요청하기"}
                    </Button>
                    <button className={styles.deleteReqBtn} onClick={handleDeleteRequest}>
                      삭제 요청
                    </button>
                  </>
                )}

                {/* REJECTED: 수정 + 심사재요청 + 즉시삭제 */}
                {project.status === "REJECTED" && (
                  <>
                    <p className={styles.reviewingMsg}>❌ 반려되었습니다. 수정 후 다시 심사 요청하세요.</p>
                    <Button fullWidth variant="outline-coral" size="sm"
                      onClick={() => navigate(`/projects/${id}/edit`)}>
                      수정하기
                    </Button>
                    <Button fullWidth variant="outline-coral" size="sm"
                      onClick={handleReviewRequest} disabled={reviewing}>
                      {reviewing ? "요청 중..." : "심사 재요청"}
                    </Button>
                    <button className={styles.deleteReqBtn} onClick={handleDeleteRejected}>
                      삭제하기
                    </button>
                  </>
                )}

                {/* REVIEW_REQUESTED: 심사중 안내 + 삭제요청 */}
                {project.status === "REVIEW_REQUESTED" && (
                  <>
                    <p className={styles.reviewingMsg}>🔍 심사 중입니다. 검토 후 승인됩니다.</p>
                    <button className={styles.deleteReqBtn} onClick={handleDeleteRequest}>
                      삭제 요청
                    </button>
                  </>
                )}

                {project.status === "APPROVED" && (
                  <p className={styles.reviewingMsg}>✅ 승인되었습니다. 시작일에 자동으로 펀딩이 시작됩니다.</p>
                )}
                {project.status === "FUNDING" && (
                  <button className={styles.deleteReqBtn} onClick={handleDeleteRequest}>
                    삭제 요청
                  </button>
                )}
                {project.status === "DELETE_REQUESTED" && (
                  <p className={styles.reviewingMsg}>🗑️ 삭제 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.</p>
                )}
                {project.status === "STOPPED" && (
                  <p className={styles.reviewingMsg}>⏹ 운영이 중단된 프로젝트입니다. 문의가 필요하면 고객센터에 연락해주세요.</p>
                )}
                {project.status === "SUCCESS" && (
                  <p className={styles.reviewingMsg}>🎉 펀딩에 성공했습니다! 후원자분들께 감사드립니다.</p>
                )}
                {project.status === "FAILED" && (
                  <p className={styles.reviewingMsg}>😢 목표 금액에 도달하지 못했습니다. 후원자분들께 환불이 진행됩니다.</p>
                )}
              </div>
            )}

            {/* ── 수정 모달 ── */}
            {editing && (
              <div style={{ marginTop: 16, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
                <h3 style={{ marginBottom: 12, fontSize: 15 }}>프로젝트 수정</h3>
                {[
                  { label: "제목",     key: "title",      type: "text" },
                  { label: "목표금액", key: "goalAmount", type: "number" },
                  { label: "시작일",   key: "startAt",    type: "datetime-local" },
                  { label: "마감일",   key: "deadline",   type: "datetime-local" },
                ].map(({ label, key, type }) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>{label}</label>
                    <input
                      type={type}
                      value={editForm[key]}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "8px 0", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>취소</button>
                  <Button size="sm" onClick={handleEditSave} disabled={editSaving} style={{ flex: 1 }}>
                    {editSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            )}

            {/* ── 후원 입력 ── */}
            {showDonate && (
              <div className={styles.donateBox}>
                <input
                  className={styles.donateInput}
                  type="number" min={1000} step={1000}
                  placeholder="후원 금액 입력 (최소 1,000원)"
                  value={donateAmt}
                  onChange={e => setDonateAmt(e.target.value)}
                />
                {donateAmt && (
                  <p className={styles.donatePreview}>{Number(donateAmt).toLocaleString()}원</p>
                )}
                <div className={styles.donateActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowDonate(false)}>취소</button>
                  <Button size="sm" onClick={handleDonate} disabled={donating}>
                    {donating ? "처리 중..." : "결제하기"}
                  </Button>
                </div>
              </div>
            )}

            {/* ── 액션 버튼 ── */}
            <div className={styles.actions}>
              <button className={styles.iconBtn} onClick={handleLike} aria-label="좋아요">
                <span style={{ color: liked ? "var(--coral)" : "inherit" }}>
                  {liked ? "♥" : "♡"}
                </span>
                <small>{fmtNumber(likes)}</small>
              </button>
              {!isOwner && (
                <Button
                  fullWidth size="lg"
                  onClick={() => setShowDonate(s => !s)}
                  disabled={project.status !== "FUNDING"}
                >
                  {project.status === "FUNDING" ? "후원하기" : "후원 불가"}
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
