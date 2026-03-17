/* ─────────────────────────────────────────
   api/donations.js
   /api/donations/*  (인증 필요)
───────────────────────────────────────── */
import client from "./client";

/**
 * 후원하기
 * POST /api/projects/{projectId}/donations?amount={amount}
 */
export const donate = (projectId, amount) =>
  client
    .post(`/api/projects/${projectId}/donations`, null, { params: { amount } })
    .then((r) => r.data);

/**
 * 후원 취소
 * POST /api/donations/{donationId}/cancel
 */
export const cancelDonation = (donationId) =>
  client.post(`/api/donations/${donationId}/cancel`).then((r) => r.data);

/**
 * 내 후원 내역
 * GET /api/projects/users/me/donations
 */
export const getMyDonations = () =>
  client.get("/api/projects/users/me/donations").then((r) => r.data);
