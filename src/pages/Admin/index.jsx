/* ─────────────────────────────────────────
   pages/Admin/index.jsx — 관리자 대시보드
───────────────────────────────────────── */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getStats, getAdminUsers, suspendUser, activateUser,
  getReviewProjects, approveProject, rejectProject, stopProject, resumeProject,
  getAdminDonations, refundAllByProject,
  getDeleteRequestedProjects, completeDeleteProject, rejectDeleteProject,
} from "../../api/admin";
import styles from "./Admin.module.css";

const TABS = ["📊 대시보드", "📋 심사 관리", "🚦 펀딩 관리", "🗑️ 삭제 관리", "👥 회원 관리", "💳 후원 관리"];

export default function Admin() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [tab, setTab] = useState("📊 대시보드");

  /* 데이터 */
  const [stats,     setStats]     = useState(null);
  const [projects,  setProjects]  = useState([]);
  const [fundingProjects, setFundingProjects] = useState([]);
  const [deleteProjects,  setDeleteProjects]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState({});

  /* 회원 정지 모달 */
  const [suspendModal, setSuspendModal] = useState(null); // { userId, nickname }
  const [suspendReason, setSuspendReason] = useState("");

  /* 비관리자 → 홈으로 */
  useEffect(() => {
    if (user && user.role !== "ADMIN") navigate("/");
  }, [user]);

  /* 탭별 데이터 로드 */
  useEffect(() => {
    if (tab === "📊 대시보드") loadStats();
    if (tab === "📋 심사 관리") loadProjects();
    if (tab === "🚦 펀딩 관리") loadFundingProjects();
    if (tab === "🗑️ 삭제 관리") loadDeleteProjects();
    if (tab === "👥 회원 관리") loadUsers();
    if (tab === "💳 후원 관리") loadDonations();
  }, [tab]);

  const loadStats     = () => getStats().then(setStats).catch(() => {});
  const loadProjects  = () => getReviewProjects().then(setProjects).catch(() => {});
  const loadDeleteProjects = () =>
    import("../../api/client").then(({ default: client }) =>
      client.get("/api/projects", { params: { status: "DELETE_REQUESTED", size: 50 } })
        .then(r => setDeleteProjects(r.data?.data?.content ?? r.data?.content ?? []))
        .catch(() => {})
    );

  const loadFundingProjects = () =>
    import("../../api/client").then(({ default: client }) =>
      client.get("/api/projects", { params: { status: "FUNDING", size: 50 } })
        .then(r => setFundingProjects(r.data?.data?.content ?? r.data?.content ?? []))
        .catch(() => {})
    );
  const loadUsers     = () => getAdminUsers().then(setUsers).catch(() => {});
  const loadDonations = () => getAdminDonations().then(d => {
    setDonations(d?.content ?? d ?? []);
  }).catch(() => {});

  /* 로딩 헬퍼 */
  const withLoading = async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); } finally { setLoading(l => ({ ...l, [key]: false })); }
  };

  /* 프로젝트 액션 */
  const handleApprove = (id) => withLoading(`approve_${id}`, async () => {
    await approveProject(id);
    setProjects(p => p.filter(x => x.id !== id));
  });
  const handleReject = (id) => withLoading(`reject_${id}`, async () => {
    if (!window.confirm("반려하시겠습니까?")) return;
    await rejectProject(id);
    setProjects(p => p.filter(x => x.id !== id));
  });
  const handleStop = (id) => withLoading(`stop_${id}`, async () => {
    if (!window.confirm("프로젝트를 강제 중단하시겠습니까?")) return;
    await stopProject(id);
    loadFundingProjects();
  });

  const handleCompleteDelete = (id) => withLoading(`completeDel_${id}`, async () => {
    if (!window.confirm("삭제 요청을 승인하시겠습니까?\n해당 프로젝트의 모든 후원이 환불됩니다.")) return;
    const res = await completeDeleteProject(id);
    alert(res?.data ?? "환불 후 삭제 완료");
    loadDeleteProjects();
  });

  const handleRejectDelete = (id) => withLoading(`rejectDel_${id}`, async () => {
    if (!window.confirm("삭제 요청을 거절하시겠습니까?\n프로젝트가 펀딩 중 상태로 복구됩니다.")) return;
    await rejectDeleteProject(id);
    loadDeleteProjects();
  });

  const handleRefundAll = (id) => withLoading(`refundAll_${id}`, async () => {
    if (!window.confirm("해당 프로젝트의 모든 후원을 환불하시겠습니까?")) return;
    const res = await refundAllByProject(id);
    alert(res?.data ?? "환불 처리 완료");
    loadFundingProjects();
  });

  /* 회원 정지 */
  const handleSuspend = async () => {
    if (!suspendReason.trim()) { alert("정지 사유를 입력해주세요."); return; }
    await withLoading(`suspend_${suspendModal.userId}`, async () => {
      await suspendUser(suspendModal.userId, suspendReason);
      setUsers(u => u.map(x =>
        x.id === suspendModal.userId ? { ...x, status: "SUSPENDED" } : x
      ));
    });
    setSuspendModal(null); setSuspendReason("");
  };
  const handleActivate = (userId) => withLoading(`activate_${userId}`, async () => {
    await activateUser(userId);
    setUsers(u => u.map(x =>
      x.id === userId ? { ...x, status: "ACTIVE" } : x
    ));
  });

  /* ── 통계 카드 ── */
  const StatCard = ({ icon, label, value, sub, color }) => (
    <div className={`${styles.statCard} ${color ? styles[color] : ""}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statVal}>{value?.toLocaleString() ?? "—"}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );

  const fmtMoney = (n) => n >= 10000
    ? `${Math.floor(n / 10000).toLocaleString()}만원`
    : `${n?.toLocaleString()}원`;

  return (
    <div className={styles.wrap}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link to="/" className={styles.logoLink}>← Fundit</Link>
          <h1 className={styles.sidebarTitle}>관리자</h1>
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.navItem} ${tab === t ? styles.navActive : ""}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminUser}>👤 {user?.nickname}</p>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>

        {/* ── 대시보드 ── */}
        {tab === "📊 대시보드" && (
          <div>
            <h2 className={styles.pageTitle}>대시보드</h2>
            <p className={styles.pageDesc}>Fundit 플랫폼 현황을 실시간으로 확인합니다.</p>

            {/* 통계 그리드 */}
            <div className={styles.statsGrid}>
              <StatCard icon="👥" label="전체 회원"    value={stats?.totalUsers}      sub={`활성 ${stats?.activeUsers ?? 0} / 정지 ${stats?.suspendedUsers ?? 0}`} />
              <StatCard icon="📦" label="전체 프로젝트" value={stats?.totalProjects}   sub={`펀딩중 ${stats?.fundingProjects ?? 0} / 성공 ${stats?.successProjects ?? 0}`} color="blue" />
              <StatCard icon="💳" label="전체 후원"    value={stats?.totalDonations}   color="green" />
              <StatCard icon="💰" label="누적 후원액"  value={stats ? fmtMoney(stats.successDonationAmount) : null} color="coral" />
            </div>

            {/* 상세 현황 */}
            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>회원 현황</h3>
                <div className={styles.detailRows}>
                  <div className={styles.detailRow}>
                    <span>전체 회원</span>
                    <strong>{stats?.totalUsers?.toLocaleString() ?? "—"}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>활성 회원</span>
                    <strong className="coral">{stats?.activeUsers?.toLocaleString() ?? "—"}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>정지 회원</span>
                    <strong style={{ color: "var(--red)" }}>{stats?.suspendedUsers?.toLocaleString() ?? "—"}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>프로젝트 현황</h3>
                <div className={styles.detailRows}>
                  <div className={styles.detailRow}><span>전체</span><strong>{stats?.totalProjects?.toLocaleString() ?? "—"}</strong></div>
                  <div className={styles.detailRow}><span>펀딩 중</span><strong className="coral">{stats?.fundingProjects?.toLocaleString() ?? "—"}</strong></div>
                  <div className={styles.detailRow}><span>성공</span><strong style={{ color: "#2e7d32" }}>{stats?.successProjects?.toLocaleString() ?? "—"}</strong></div>
                  <div className={styles.detailRow}><span>실패</span><strong style={{ color: "var(--red)" }}>{stats?.failedProjects?.toLocaleString() ?? "—"}</strong></div>
                </div>
              </div>

              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>후원 현황</h3>
                <div className={styles.detailRows}>
                  <div className={styles.detailRow}><span>전체 후원 건수</span><strong>{stats?.totalDonations?.toLocaleString() ?? "—"}</strong></div>
                  <div className={styles.detailRow}><span>누적 후원액</span><strong className="coral">{stats ? fmtMoney(stats.successDonationAmount) : "—"}</strong></div>
                </div>
              </div>
            </div>

            <button className={styles.refreshBtn} onClick={loadStats}>🔄 새로고침</button>
          </div>
        )}

        {/* ── 심사 관리 ── */}
        {tab === "📋 심사 관리" && (
          <div>
            <h2 className={styles.pageTitle}>심사 관리</h2>
            <p className={styles.pageDesc}>심사 요청된 프로젝트를 승인하거나 반려합니다.</p>

            {projects.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>✅</div>
                <p>심사 대기 중인 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>프로젝트명</th>
                      <th>창작자</th>
                      <th>카테고리</th>
                      <th>목표금액</th>
                      <th>마감일</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td className={styles.idCell}>#{p.id}</td>
                        <td>
                          <Link to={`/projects/${p.id}`} className={styles.projectLink} target="_blank">
                            {p.title}
                          </Link>
                        </td>
                        <td>{p.ownerNickname ?? "—"}</td>
                        <td>{p.categoryName ?? "—"}</td>
                        <td>{p.goalAmount?.toLocaleString()}원</td>
                        <td>{p.deadline ? p.deadline.slice(0, 10) : "—"}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleApprove(p.id)}
                              disabled={loading[`approve_${p.id}`]}
                            >
                              {loading[`approve_${p.id}`] ? "처리중" : "✅ 승인"}
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleReject(p.id)}
                              disabled={loading[`reject_${p.id}`]}
                            >
                              {loading[`reject_${p.id}`] ? "처리중" : "❌ 반려"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 펀딩 관리 ── */}
        {tab === "🚦 펀딩 관리" && (
          <div>
            <h2 className={styles.pageTitle}>펀딩 관리</h2>
            <p className={styles.pageDesc}>펀딩 중인 프로젝트를 강제 중단하거나 전체 환불 처리합니다.</p>

            {fundingProjects.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🚦</div>
                <p>현재 펀딩 중인 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>프로젝트명</th>
                      <th>창작자</th>
                      <th>목표금액</th>
                      <th>현재금액</th>
                      <th>달성률</th>
                      <th>마감일</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundingProjects.map(p => (
                      <tr key={p.id}>
                        <td className={styles.idCell}>#{p.id}</td>
                        <td>
                          <Link to={`/projects/${p.id}`} className={styles.projectLink} target="_blank">
                            {p.title}
                          </Link>
                        </td>
                        <td>{p.ownerNickname ?? "—"}</td>
                        <td>{p.goalAmount?.toLocaleString()}원</td>
                        <td>{p.currentAmount?.toLocaleString() ?? 0}원</td>
                        <td className="coral"><strong>{p.progressPercent ?? 0}%</strong></td>
                        <td>{p.deadline ? p.deadline.slice(0, 10) : "—"}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleStop(p.id)}
                              disabled={loading[`stop_${p.id}`]}
                            >
                              {loading[`stop_${p.id}`] ? "처리중" : "⏹ 강제중단"}
                            </button>
                            <button
                              className={styles.refundBtn ?? styles.rejectBtn}
                              onClick={() => handleRefundAll(p.id)}
                              disabled={loading[`refundAll_${p.id}`]}
                              style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                            >
                              {loading[`refundAll_${p.id}`] ? "처리중" : "💸 전체환불"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 삭제 관리 ── */}
        {tab === "🗑️ 삭제 관리" && (
          <div>
            <h2 className={styles.pageTitle}>삭제 관리</h2>
            <p className={styles.pageDesc}>삭제 요청된 프로젝트를 승인하거나 거절합니다. 승인 시 모든 후원이 자동 환불됩니다.</p>

            {deleteProjects.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🗑️</div>
                <p>삭제 요청된 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>프로젝트명</th>
                      <th>창작자</th>
                      <th>목표금액</th>
                      <th>현재금액</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deleteProjects.map(p => (
                      <tr key={p.id}>
                        <td className={styles.idCell}>#{p.id}</td>
                        <td>
                          <Link to={`/projects/${p.id}`} className={styles.projectLink} target="_blank">
                            {p.title}
                          </Link>
                        </td>
                        <td>{p.ownerNickname ?? "—"}</td>
                        <td>{p.goalAmount?.toLocaleString()}원</td>
                        <td>{p.currentAmount?.toLocaleString() ?? 0}원</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleCompleteDelete(p.id)}
                              disabled={loading[`completeDel_${p.id}`]}
                              style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                            >
                              {loading[`completeDel_${p.id}`] ? "처리중" : "🗑️ 삭제 승인"}
                            </button>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleRejectDelete(p.id)}
                              disabled={loading[`rejectDel_${p.id}`]}
                            >
                              {loading[`rejectDel_${p.id}`] ? "처리중" : "↩️ 거절"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 회원 관리 ── */}
        {tab === "👥 회원 관리" && (
          <div>
            <h2 className={styles.pageTitle}>회원 관리</h2>
            <p className={styles.pageDesc}>전체 회원 목록을 조회하고 정지/활성화합니다.</p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>가입 방식</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={u.status === "SUSPENDED" ? styles.suspendedRow : ""}>
                      <td className={styles.idCell}>#{u.id}</td>
                      <td><strong>{u.nickname}</strong></td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td>
                        <span className={styles.providerBadge}>
                          {u.provider === "KAKAO" ? "🟡 카카오"
                           : u.provider === "NAVER" ? "🟢 네이버"
                           : "📧 이메일"}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${u.status === "SUSPENDED" ? styles.suspended : styles.active}`}>
                          {u.status === "SUSPENDED" ? "정지" : "활성"}
                        </span>
                      </td>
                      <td>
                        {u.status === "SUSPENDED" ? (
                          <button
                            className={styles.activateBtn}
                            onClick={() => handleActivate(u.id)}
                            disabled={loading[`activate_${u.id}`]}
                          >
                            {loading[`activate_${u.id}`] ? "처리중" : "✅ 활성화"}
                          </button>
                        ) : (
                          <button
                            className={styles.suspendBtn}
                            onClick={() => { setSuspendModal({ userId: u.id, nickname: u.nickname }); setSuspendReason(""); }}
                          >
                            🚫 정지
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 후원 관리 ── */}
        {tab === "💳 후원 관리" && (
          <div>
            <h2 className={styles.pageTitle}>후원 관리</h2>
            <p className={styles.pageDesc}>전체 후원 내역을 확인합니다.</p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>프로젝트</th>
                    <th>후원자</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>후원일</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => (
                    <tr key={d.id ?? i}>
                      <td className={styles.idCell}>#{d.id}</td>
                      <td>{d.projectTitle ?? `프로젝트 #${d.projectId}`}</td>
                      <td>{d.userNickname ?? d.userId}</td>
                      <td className="coral"><strong>{d.amount?.toLocaleString()}원</strong></td>
                      <td>
                        <span className={`${styles.donationBadge} ${styles[d.status?.toLowerCase()]}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString("ko-KR") : "—"}
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--light)" }}>후원 내역이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── 정지 사유 모달 ── */}
      {suspendModal && (
        <div className={styles.overlay} onClick={() => setSuspendModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>🚫 회원 정지</h3>
            <p className={styles.modalDesc}>
              <strong>{suspendModal.nickname}</strong> 님을 정지합니다.
            </p>
            <textarea
              className={styles.reasonInput}
              placeholder="정지 사유를 입력해주세요."
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              rows={4}
            />
            <div className={styles.modalFooter}>
              <button className={styles.cancelModalBtn} onClick={() => setSuspendModal(null)}>취소</button>
              <button className={styles.confirmSuspendBtn} onClick={handleSuspend}>정지 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
