/* ─────────────────────────────────────────
   pages/UserProfile/index.jsx
   타인 프로필 페이지 — /users/:userId
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectCard from "../../components/common/ProjectCard";
import { Tabs, TabPanel } from "../../components/ui/Tabs";
import { useAuth } from "../../context/AuthContext";
import {
  followUser, unfollowUser, isFollowing,
  getFollowerCount, getFollowingCount,
  getFollowers, getFollowings,
} from "../../api/users";
import { getProjects } from "../../api/projects";
import client from "../../api/client";
import styles from "./UserProfile.module.css";

const TABS = ["올린 프로젝트", "팔로워", "팔로잉"];

export default function UserProfile() {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const { user: me } = useAuth();

  const [profile,       setProfile]       = useState(null);
  const [projects,      setProjects]      = useState([]);
  const [following,     setFollowing]     = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount,setFollowingCount]= useState(0);
  const [followerList,  setFollowerList]  = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [activeTab,     setActiveTab]     = useState("올린 프로젝트");
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      // 유저 정보 — GET /api/users/{userId} (있으면)
      client.get(`/api/users/${userId}`).then(r => r.data?.data ?? r.data).catch(() => null),
      // 팔로워/팔로잉 수
      getFollowerCount(userId).then(r => r?.data ?? r ?? 0).catch(() => 0),
      getFollowingCount(userId).then(r => r?.data ?? r ?? 0).catch(() => 0),
      // 해당 유저 프로젝트 목록
      getProjects({ ownerId: userId, size: 50 })
        .then(r => (r?.content ?? []).filter(p => p.status !== "DELETED")).catch(() => []),
      // 팔로워/팔로잉 목록
      getFollowers(userId).catch(() => []),
      getFollowings(userId).catch(() => []),
    ]).then(([prof, fc, fic, projs, followers, followings]) => {
      setProfile(prof);
      setFollowerCount(fc);
      setFollowingCount(fic);
      setProjects(projs);
      setFollowerList(followers ?? []);
      setFollowingList(followings ?? []);
    }).finally(() => setLoading(false));

    // 내 팔로우 여부
    if (me) {
      isFollowing(userId).then(r => setFollowing(r?.data ?? r ?? false)).catch(() => {});
    }
  }, [userId, me]);

  const handleFollow = async () => {
    if (!me) { navigate("/login"); return; }
    try {
      if (following) { await unfollowUser(userId); setFollowerCount(c => c - 1); }
      else            { await followUser(userId);   setFollowerCount(c => c + 1); }
      setFollowing(f => !f);
    } catch (e) {
      alert(e.response?.data?.message ?? "오류가 발생했습니다.");
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (!profile) return <div className={styles.loading}>유저를 찾을 수 없습니다.</div>;

  const isMe = me && String(me.id) === String(userId);

  return (
    <div className="page-wrap animate-fade-up">
      {/* 프로필 헤더 */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {profile.profileImage
            ? <img src={profile.profileImage} alt={profile.nickname} />
            : "👤"}
        </div>

        <div className={styles.info}>
          <h1 className={styles.nickname}>{profile.nickname}</h1>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statVal}>{followerCount}</span>
              <span className={styles.statLabel}>팔로워</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statVal}>{followingCount}</span>
              <span className={styles.statLabel}>팔로잉</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statVal}>{projects.length}</span>
              <span className={styles.statLabel}>프로젝트</span>
            </div>
          </div>
        </div>

        {/* 팔로우 버튼 — 본인이면 숨김 */}
        {!isMe && (
          <button
            className={`${styles.followBtn} ${following ? styles.following : ""}`}
            onClick={handleFollow}
          >
            {following ? "팔로잉" : "+ 팔로우"}
          </button>
        )}
        {isMe && (
          <button className={styles.editBtn} onClick={() => navigate("/mypage")}>
            마이페이지
          </button>
        )}
      </div>

      <div className="divider" />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <TabPanel active={activeTab} value="올린 프로젝트">
        {projects.length > 0
          ? <div className={styles.grid}>
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          : <div className="empty-state"><div className="icon">📦</div><p>올린 프로젝트가 없습니다.</p></div>
        }
      </TabPanel>

      <TabPanel active={activeTab} value="팔로워">
        {followerList.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {followerList.map(u => (
                <div key={u.id}
                  onClick={() => navigate(`/users/${u.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,.06)", cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0f0f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {u.profileImage ? <img src={u.profileImage} alt={u.nickname} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{u.nickname}</span>
                </div>
              ))}
            </div>
          : <div className="empty-state"><div className="icon">👥</div><p>팔로워가 없습니다.</p></div>
        }
      </TabPanel>

      <TabPanel active={activeTab} value="팔로잉">
        {followingList.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {followingList.map(u => (
                <div key={u.id}
                  onClick={() => navigate(`/users/${u.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,.06)", cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0f0f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {u.profileImage ? <img src={u.profileImage} alt={u.nickname} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{u.nickname}</span>
                </div>
              ))}
            </div>
          : <div className="empty-state"><div className="icon">💫</div><p>팔로잉 중인 창작자가 없습니다.</p></div>
        }
      </TabPanel>
    </div>
  );
}
