/* ─────────────────────────────────────────
   pages/MyPage/index.jsx  — 실제 API 연동
───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabPanel } from "../../components/ui/Tabs";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { getMyProjects, getMyLikes } from "../../api/users";
import { getMyDonations } from "../../api/donations";
import ProjectCard from "../../components/common/ProjectCard";
import styles from "./MyPage.module.css";

const MY_TABS = ["내 프로젝트", "후원 내역", "찜 목록", "팔로워", "팔로잉"];

export default function MyPage() {
  const navigate        = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("내 프로젝트");
  const [myProjects,  setMyProjects]  = useState([]);
  const [donations,   setDonations]   = useState([]);
  const [likes,       setLikes]       = useState([]);

  /* 비로그인이면 로그인 페이지로 */
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  /* 데이터 로드 */
  useEffect(() => {
    if (!user) return;
    getMyProjects().then(setMyProjects).catch(() => {});
    getMyDonations().then(setDonations).catch(() => {});
    getMyLikes().then(setLikes).catch(() => {});
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="page-wrap animate-fade-up">
      {/* 프로필 헤더 */}
      <div className={styles.profileSection}>
        <div className={styles.avatar}>
          {user.profileImage
            ? <img src={user.profileImage} alt={user.nickname} />
            : "👤"}
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{user.nickname}</h1>
          <p className={styles.email}>{user.email}</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statVal}>{myProjects.length}</span>
              <span className={styles.statLabel}>프로젝트</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statVal}>{donations.length}</span>
              <span className={styles.statLabel}>후원</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statVal}>{likes.length}</span>
              <span className={styles.statLabel}>찜</span>
            </div>
          </div>
        </div>

        <Button variant="outline-coral" className={styles.editBtn}
          onClick={() => navigate("/mypage/edit")}>
          프로필 편집
        </Button>
      </div>

      <div className="divider" />

      <Tabs tabs={MY_TABS} active={activeTab} onChange={setActiveTab} />

      <TabPanel active={activeTab} value="내 프로젝트">
        {myProjects.length > 0
          ? <div className={styles.grid}>
              {myProjects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          : <div className="empty-state"><div className="icon">📦</div><p>등록한 프로젝트가 없습니다.</p></div>
        }
      </TabPanel>

      <TabPanel active={activeTab} value="후원 내역">
        {donations.length > 0
          ? <div className={styles.donationList}>
              {donations.map((d, i) => (
                <div key={i} className={styles.donationRow}>
                  <span className={styles.donationTitle}>{d.projectTitle ?? `프로젝트 #${d.projectId}`}</span>
                  <span className={styles.donationAmount}>{(d.amount ?? 0).toLocaleString()}원</span>
                  <span className={`${styles.donationStatus} ${styles[d.status?.toLowerCase()]}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          : <div className="empty-state"><div className="icon">💳</div><p>후원 내역이 없습니다.</p></div>
        }
      </TabPanel>

      <TabPanel active={activeTab} value="찜 목록">
        {likes.length > 0
          ? <div className={styles.grid}>
              {likes.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          : <div className="empty-state"><div className="icon">❤️</div><p>찜한 프로젝트가 없습니다.</p></div>
        }
      </TabPanel>

      <TabPanel active={activeTab} value="팔로워">
        <div className="empty-state"><div className="icon">👥</div><p>팔로워가 없습니다.</p></div>
      </TabPanel>

      <TabPanel active={activeTab} value="팔로잉">
        <div className="empty-state"><div className="icon">💫</div><p>팔로잉 중인 창작자가 없습니다.</p></div>
      </TabPanel>
    </div>
  );
}
