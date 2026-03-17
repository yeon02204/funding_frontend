/* ─────────────────────────────────────────
   api/users.js
───────────────────────────────────────── */
import client from "./client";

/** 내 정보 조회 */
export const getMe = () =>
  client.get("/api/users/me").then((r) => r.data?.data);

/** 프로필 수정 */
export const updateProfile = (data) =>
  client.put("/api/users/me", data).then((r) => r.data?.data);

/** 내 프로젝트 목록 */
export const getMyProjects = () =>
  client.get("/api/users/me/projects").then((r) => r.data?.data ?? []);

/** 찜 목록 */
export const getMyLikes = () =>
  client.get("/api/users/me/likes").then((r) => r.data?.data ?? []);

/** 팔로우  POST /api/users/{userId}/follow */
export const followUser = (userId) =>
  client.post(`/api/users/${userId}/follow`).then((r) => r.data);

/** 언팔로우  DELETE /api/users/{userId}/follow */
export const unfollowUser = (userId) =>
  client.delete(`/api/users/${userId}/follow`).then((r) => r.data);

/** 내 팔로우 여부  GET /api/users/{userId}/follow/me */
export const isFollowing = (userId) =>
  client.get(`/api/users/${userId}/follow/me`).then((r) => r.data);

/** 팔로워 수  GET /api/users/{userId}/followers/count */
export const getFollowerCount = (userId) =>
  client.get(`/api/users/${userId}/followers/count`).then((r) => r.data);

/** 팔로잉 수  GET /api/users/{userId}/following/count */
export const getFollowingCount = (userId) =>
  client.get(`/api/users/${userId}/following/count`).then((r) => r.data);

/** 회원 탈퇴  DELETE /api/users/me */
export const withdraw = () =>
  client.delete("/api/users/me").then((r) => r.data);

/** 비밀번호 변경  PUT /api/auth/password */
export const changePassword = (data) =>
  client.put("/api/auth/password", data).then((r) => r.data);

/** 팔로워 목록  GET /api/users/{userId}/followers */
export const getFollowers = (userId) =>
  client.get(`/api/users/${userId}/followers`).then((r) => r.data);

/** 팔로잉 목록  GET /api/users/{userId}/followings */
export const getFollowings = (userId) =>
  client.get(`/api/users/${userId}/followings`).then((r) => r.data);
