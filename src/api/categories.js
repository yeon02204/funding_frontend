/* ─────────────────────────────────────────
   api/categories.js
   GET /api/categories (공개)
───────────────────────────────────────── */
import client from "./client";

/**
 * 카테고리 전체 목록
 * GET /api/categories
 * → ApiResponse<Category[]>  — Category: { id, name }
 */
export const getCategories = () =>
  client.get("/api/categories").then((r) => r.data?.data ?? []);
