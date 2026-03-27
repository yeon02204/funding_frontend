/* ─────────────────────────────────────────
   api/projects.js
   /api/projects/*
───────────────────────────────────────── */
import client from "./client";

/*
 * 프로젝트 목록 조회 (공개)
 * GET /api/projects
 * @param {object} params - { status, categoryId, keyword, tagName, sortBy, page, size }
 * @returns Page<ProjectSummaryResponse>
 */
export const getProjects = (params = {}) =>
  client.get("/api/projects", { params }).then((r) => r.data);

/*
 * 프로젝트 단건 조회 (공개)
 * GET /api/projects/{id}
 * @returns ProjectDetailResponse
 */
export const getProject = (id) =>
  client.get(`/api/projects/${id}`).then((r) => r.data);

/*
 * 프로젝트 등록 (인증 필요)
 * POST /api/projects   multipart/form-data
 *
 * @param {object} request - {
 *   title: string,
 *   content: string,       ← Toast UI editor HTML
 *   categoryId: number,
 *   goalAmount: number,
 *   startAt: string,       ← "2026-03-06T00:00:00" (LocalDateTime)
 *   deadline: string,      ← "2026-04-05T23:59:59"
 *   thumbnailIndex: number ← images 배열에서 대표 이미지 번호 (0, 1, 2...)
 * }
 * @param {File[]} images - 업로드할 이미지 배열 (최대 20MB each)
 * @returns 생성된 projectId (Long)
 */
export const createProject = (request, images) => {
  const formData = new FormData();

  // JSON 파트 — Spring @RequestPart("request")
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" })
  );

  // 이미지 파트 — Spring @RequestPart("images")
  images.forEach((file) => formData.append("images", file));

  return client
    .post("/api/projects", formData)  // Content-Type 수동 지정 제거 — axios가 boundary 포함해서 자동 설정
    .then((r) => r.data);
};

/*
 * 좋아요 등록
 * POST /api/projects/{projectId}/likes
 */
export const likeProject = (projectId) =>
  client.post(`/api/projects/${projectId}/likes`).then((r) => r.data);

/*
 * 좋아요 취소
 * DELETE /api/projects/{projectId}/likes
 */
export const unlikeProject = (projectId) =>
  client.delete(`/api/projects/${projectId}/likes`).then((r) => r.data);

/*
 * 좋아요 여부 확인
 * GET /api/projects/{projectId}/likes/me
 */
export const isLiked = (projectId) =>
  client.get(`/api/projects/${projectId}/likes/me`).then((r) => r.data);

/*
 * 좋아요 수 조회 (공개)
 * GET /api/projects/{projectId}/likes/count
 */
export const getLikeCount = (projectId) =>
  client.get(`/api/projects/${projectId}/likes/count`).then((r) => r.data);

/*
 * 프로젝트별 후원 목록 (작성자/관리자)
 * GET /api/projects/{projectId}/donations
 */
export const getProjectDonations = (projectId) =>
  client.get(`/api/projects/${projectId}/donations`).then((r) => r.data);

// 심사 요청  POST /api/projects/{id}/review-request 
export const requestReview = (projectId) =>
  client.post(`/api/projects/${projectId}/review-request`).then((r) => r.data);

// 삭제 요청  POST /api/projects/{id}/delete-request 
export const requestDelete = (projectId) =>
  client.post(`/api/projects/${projectId}/delete-request`).then((r) => r.data);

// 태그 조회  GET /api/projects/{id}/tags 
export const getProjectTags = (projectId) =>
  client.get(`/api/projects/${projectId}/tags`).then((r) => r.data);

// 태그 수정  PUT /api/projects/{id}/tags 
export const updateProjectTags = (projectId, tags) =>
  client.put(`/api/projects/${projectId}/tags`, { tags }).then((r) => r.data);

/*
 * 프로젝트 수정 (DRAFT 상태 + 소유자만 가능)
 * PATCH /api/projects/{id}
 * @param {number} projectId
 * @param {{ title, content, goalAmount, startAt, deadline, categoryId }} data
 */
export const updateProject = (projectId, data) =>
  client.patch(`/api/projects/${projectId}`, data).then((r) => r.data);

export const deleteRejectedProject = (id) =>
  client.post(`/api/projects/${id}/delete-rejected`).then(r => r.data);
// 이미지 교체  POST /api/projects/{id}/images
export const updateProjectImages = (id, images, thumbnailIndex = 0) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify({ thumbnailIndex })], { type: "application/json" })
  );
  images.forEach((f) => formData.append("images", f));
  return client.post(`/api/projects/${id}/images`, formData).then((r) => r.data);
};
