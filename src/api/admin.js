/* ─────────────────────────────────────────
   api/admin.js — 관리자 전용 API
───────────────────────────────────────── */
import client from "./client";

/** 통계  GET /api/admin/stats */
export const getStats = () =>
  client.get("/api/admin/stats").then(r => r.data?.data ?? r.data);

/** 회원 목록  GET /api/admin/users */
export const getAdminUsers = () =>
  client.get("/api/admin/users").then(r => r.data?.data ?? []);

/** 회원 정지  PATCH /api/admin/users/{id}/suspend */
export const suspendUser = (userId, reason) =>
  client.patch(`/api/admin/users/${userId}/suspend`, { reason }).then(r => r.data);

/** 정지 해제  PATCH /api/admin/users/{id}/activate */
export const activateUser = (userId) =>
  client.patch(`/api/admin/users/${userId}/activate`).then(r => r.data);

/** 후원 목록  GET /api/admin/donations */
export const getAdminDonations = (page = 0, size = 20) =>
  client.get("/api/admin/donations", { params: { page, size } }).then(r => r.data);

/** 심사 대기 프로젝트  GET /api/projects?status=REVIEW_REQUESTED */
export const getReviewProjects = () =>
  client.get("/api/projects", { params: { status: "REVIEW_REQUESTED", size: 50 } })
    .then(r => r.data?.data?.content ?? r.data?.content ?? []);

/** 프로젝트 승인  POST /api/projects/{id}/approve */
export const approveProject = (id) =>
  client.post(`/api/projects/${id}/approve`).then(r => r.data);

/** 프로젝트 반려  POST /api/projects/{id}/reject */
export const rejectProject = (id) =>
  client.post(`/api/projects/${id}/reject`).then(r => r.data);

/** 프로젝트 강제 중단  POST /api/projects/{id}/stop */
export const stopProject = (id) =>
  client.post(`/api/projects/${id}/stop`).then(r => r.data);

/** 프로젝트 재개  POST /api/projects/{id}/resume */
export const resumeProject = (id) =>
  client.post(`/api/projects/${id}/resume`).then(r => r.data);

/** 프로젝트 전체 환불  POST /api/admin/projects/{id}/refund-all */
export const refundAllByProject = (id) =>
  client.post(`/api/admin/projects/${id}/refund-all`).then(r => r.data);

/** 삭제 요청 목록  GET /api/projects?status=DELETE_REQUESTED */
export const getDeleteRequestedProjects = () =>
  client.get("/api/projects", { params: { status: "DELETE_REQUESTED", size: 50 } })
    .then(r => r.data?.data?.content ?? r.data?.content ?? []);

/** 삭제 승인 (환불 + DELETED)  POST /api/projects/{id}/complete-delete */
export const completeDeleteProject = (id) =>
  client.post(`/api/projects/${id}/complete-delete`).then(r => r.data);

/** 삭제 거절 (FUNDING 복구)  POST /api/projects/{id}/reject-delete */
export const rejectDeleteProject = (id) =>
  client.post(`/api/projects/${id}/reject-delete`).then(r => r.data);
