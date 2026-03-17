/* ─────────────────────────────────────────
   hooks/useProjects.js  — 실제 API 연동
───────────────────────────────────────── */
import { useState, useEffect } from "react";
import { getProjects, getProject } from "../api/projects";

/**
 * 프로젝트 목록 조회
 * GET /api/projects → Page<ProjectSummaryResponse> 직접 반환
 */
export function useProjects(filters = {}) {
  const [data, setData]       = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProjects(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}

/**
 * 단일 프로젝트 조회
 * GET /api/projects/{id}
 * 서버 응답이 ApiResponse 래퍼{ success, data }면 .data 꺼내고,
 * 아니면 그대로 사용
 */
export function useProject(id) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProject(id)
      .then((res) => {
        // ApiResponse 래퍼 자동 감지
        const project = res?.success !== undefined ? res.data : res;
        setData(project);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
