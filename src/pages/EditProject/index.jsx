/* ─────────────────────────────────────────
   pages/EditProject/index.jsx

   API:  PATCH /api/projects/{id}
   DRAFT / REJECTED 상태인 본인 프로젝트만 수정 가능
───────────────────────────────────────── */
import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { getProject, updateProject, updateProjectImages, deleteProjectImage } from "../../api/projects";
import { getCategories } from "../../api/categories";
import styles from "../CreateProject/CreateProject.module.css";

const STEPS = ["기본 정보", "프로젝트 스토리", "펀딩 설정", "이미지"];

export default function EditProject() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const editorRef = useRef();

  const [step,       setStep]       = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [categories, setCategories] = useState([]);
  const [content,    setContent]    = useState("");

  // 기존 이미지 URL (서버에 저장된 것)
  const [existingImages,   setExistingImages]   = useState([]);
  const [existingThumbUrl, setExistingThumbUrl] = useState(null);

  // 새로 추가할 이미지 파일
  const [newImages,   setNewImages]   = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [thumbSource, setThumbSource] = useState("existing"); // "existing" | number(new index)

  const [form, setForm] = useState({
    title:      "",
    categoryId: "",
    goalAmount: "",
    startAt:    "",
    deadline:   "",
  });

  /* 프로젝트 + 카테고리 로드 */
  useEffect(() => {
    Promise.all([getProject(id), getCategories()])
      .then(([project, cats]) => {
        const p = project?.data ?? project;
        setForm({
          title:      p.title      ?? "",
          categoryId: p.categoryId ?? "",
          goalAmount: p.goalAmount ?? "",
          startAt:    p.startAt    ? p.startAt.slice(0, 16) : "",
          deadline:   p.deadline   ? p.deadline.slice(0, 16) : "",
        });
        setContent(p.content ?? "");
        setCategories(cats);
        setExistingImages(p.imageUrls ?? []);
        setExistingThumbUrl(p.thumbnailUrl ?? null);
      })
      .catch(() => setError("프로젝트 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  /* 새 이미지 미리보기 URL */
  useEffect(() => {
    const urls = newImages.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [newImages]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleNewImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    if (thumbSource === idx) setThumbSource("existing");
  };

  const handleDeleteExistingImage = async (url) => {
    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;
    try {
      await deleteProjectImage(id, url);
      setExistingImages(prev => prev.filter(u => u !== url));
      if (existingThumbUrl === url) {
        setExistingThumbUrl(prev => existingImages.find(u => u !== url) ?? null);
      }
    } catch (e) {
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  const durationDays = form.startAt && form.deadline
    ? Math.ceil((new Date(form.deadline) - new Date(form.startAt)) / 86400000)
    : null;

  const canNext = [
    !!(form.title.trim() && form.categoryId),
    true,
    !!(form.goalAmount && form.startAt && form.deadline &&
       new Date(form.startAt) < new Date(form.deadline)),
    true, // 이미지는 기존 것 유지 가능하므로 필수 아님
  ];

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      // 1단계: 기본 정보 수정
      await updateProject(id, {
        title:      form.title.trim(),
        content,
        categoryId: Number(form.categoryId),
        goalAmount: Number(form.goalAmount),
        startAt:    form.startAt  + ":00",
        deadline:   form.deadline + ":00",
      });

      // 2단계: 새 이미지가 있으면 업로드
      if (newImages.length > 0) {
        const thumbnailIndex = thumbSource === "existing" ? 0 : thumbSource;
        await updateProjectImages(id, newImages, thumbnailIndex);
      }

      alert("수정이 완료되었습니다.");
      navigate(`/projects/${id}`);
    } catch (e) {
      setError(e.response?.data?.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>로딩 중...</div>;

  return (
    <div className={styles.page}>

      {/* ── Stepper ── */}
      <div className={styles.stepperWrap}>
        <div className={styles.stepper}>
          {STEPS.map((label, i) => (
            <div key={label} className={styles.stepItem}>
              <button
                className={`${styles.stepCircle}
                  ${i === step ? styles.stepCurrent : ""}
                  ${i < step   ? styles.stepDone    : ""}
                  ${i > step   ? styles.stepFuture  : ""}`}
                onClick={() => i < step && setStep(i)}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ""}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepConnector} ${i < step ? styles.stepConnectorDone : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          <h2 style={{ marginBottom: 24, fontSize: 20 }}>✏️ 프로젝트 수정</h2>

          {/* ── STEP 0: 기본 정보 ── */}
          {step === 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>기본 정보</h2>
                <p className={styles.sectionDesc}>프로젝트의 제목과 카테고리를 수정하세요.</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>프로젝트 제목 <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  value={form.title}
                  maxLength={100}
                  onChange={(e) => set("title", e.target.value)}
                />
                <div className={styles.inputMeta}>
                  <span />
                  <span className={styles.charCount}>{form.title.length}/100</span>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>카테고리 <span className={styles.req}>*</span></label>
                <div className={styles.catGrid}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.catChip} ${form.categoryId == cat.id ? styles.catChipOn : ""}`}
                      onClick={() => set("categoryId", cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: 스토리 ── */}
          {step === 1 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>프로젝트 스토리</h2>
                <p className={styles.sectionDesc}>본문 내용을 수정하세요.</p>
              </div>
              <div className={styles.editorWrap}>
                <Editor
                  ref={editorRef}
                  height="520px"
                  initialEditType="wysiwyg"
                  previewStyle="vertical"
                  initialValue={content || " "}
                  language="ko-KR"
                  hooks={{
                    addImageBlobHook: async (blob, callback) => {
                      try {
                        const formData = new FormData();
                        formData.append("file", blob);
                        const { default: client } = await import("../../api/client");
                        const res = await client.post("/api/uploads/images", formData);
                        callback(res.data.url, "image");
                      } catch (e) {
                        alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
                      }
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: 펀딩 설정 ── */}
          {step === 2 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>펀딩 설정</h2>
                <p className={styles.sectionDesc}>목표 금액과 펀딩 기간을 수정하세요.</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>목표 금액 <span className={styles.req}>*</span></label>
                <div className={styles.amountRow}>
                  <input
                    className={`${styles.input} ${styles.amountInput}`}
                    type="number" min={10000} step={10000}
                    value={form.goalAmount}
                    onChange={(e) => set("goalAmount", e.target.value)}
                  />
                  <span className={styles.amountUnit}>원</span>
                </div>
                {form.goalAmount > 0 && (
                  <p className={styles.amountPreview}>= {Number(form.goalAmount).toLocaleString()}원</p>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>펀딩 기간 <span className={styles.req}>*</span></label>
                <div className={styles.dateRow}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateTag}>시작</span>
                    <input className={styles.input} type="datetime-local" value={form.startAt}
                      onChange={(e) => set("startAt", e.target.value)} />
                  </div>
                  <span className={styles.dateArrow}>→</span>
                  <div className={styles.dateItem}>
                    <span className={styles.dateTag}>마감</span>
                    <input className={styles.input} type="datetime-local" value={form.deadline} min={form.startAt}
                      onChange={(e) => set("deadline", e.target.value)} />
                  </div>
                </div>
                {durationDays !== null && durationDays > 0 && (
                  <div className={styles.durationChip}>📅 총 {durationDays}일간 진행</div>
                )}
                {durationDays !== null && durationDays <= 0 && (
                  <p className={styles.dateError}>마감일은 시작일보다 늦어야 합니다.</p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: 이미지 ── */}
          {step === 3 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>이미지 수정</h2>
                <p className={styles.sectionDesc}>
                  새 이미지를 추가하면 기존 이미지가 교체됩니다. 추가하지 않으면 기존 이미지가 유지됩니다.
                </p>
              </div>

              {/* 기존 이미지 */}
              {existingImages.length > 0 && newImages.length === 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: "var(--mid)", marginBottom: 10 }}>📌 현재 이미지</p>
                  <div className={styles.imgGrid}>
                    {existingImages.map((url, i) => (
                      <div key={i} className={`${styles.imgCard} ${url === existingThumbUrl ? styles.imgCardThumb : ""}`}>
                        <img src={url} alt="" className={styles.imgThumb} />
                        <div className={styles.imgActions}>
                          {url === existingThumbUrl && (
                            <span className={`${styles.btnThumb} ${styles.btnThumbOn}`}>★ 대표</span>
                          )}
                          <button className={styles.btnRemove} onClick={() => handleDeleteExistingImage(url)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 새 이미지 추가 */}
              {newImages.length < 5 && (
                <label className={styles.dropzone}>
                  <input type="file" accept="image/*" multiple hidden onChange={handleNewImageAdd} />
                  <span className={styles.dropIcon}>🖼</span>
                  <span className={styles.dropText}>
                    {newImages.length === 0 ? "클릭하여 새 이미지 추가 (선택)" : "이미지 추가"}
                  </span>
                  <span className={styles.dropSub}>JPG · PNG · GIF — 파일당 최대 20MB · {newImages.length}/5</span>
                </label>
              )}

              {/* 새 이미지 미리보기 */}
              {newPreviews.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, color: "var(--coral)", margin: "16px 0 10px" }}>🆕 새로 추가할 이미지</p>
                  <div className={styles.imgGrid}>
                    {newPreviews.map((url, i) => (
                      <div key={i} className={`${styles.imgCard} ${thumbSource === i ? styles.imgCardThumb : ""}`}>
                        <img src={url} alt="" className={styles.imgThumb} />
                        <div className={styles.imgActions}>
                          <button
                            className={`${styles.btnThumb} ${thumbSource === i ? styles.btnThumbOn : ""}`}
                            onClick={() => setThumbSource(i)}
                          >
                            {thumbSource === i ? "★ 대표" : "☆ 대표"}
                          </button>
                          <button className={styles.btnRemove} onClick={() => removeNewImage(i)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 에러 ── */}
          {error && <div className={styles.errorBox}>⚠ {error}</div>}

          {/* ── 하단 버튼 ── */}
          <div className={styles.nav}>
            {step > 0
              ? <button className={styles.btnBack} onClick={() => { setError(""); setStep((s) => s - 1); }}>← 이전</button>
              : <button className={styles.btnBack} onClick={() => navigate(`/projects/${id}`)}>← 돌아가기</button>
            }
            {step < STEPS.length - 1
              ? (
                <button
                  className={`${styles.btnNext} ${!canNext[step] ? styles.btnNextOff : ""}`}
                  onClick={() => {
                    if (!canNext[step]) return;
                    setError("");
                    if (step === 1) {
                      setContent(editorRef.current?.getInstance().getHTML() ?? "");
                    }
                    setStep((s) => s + 1);
                  }}
                >
                  다음 →
                </button>
              ) : (
                <button
                  className={`${styles.btnSubmit} ${submitting ? styles.btnNextOff : ""}`}
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "저장 중..." : "💾 수정 완료"}
                </button>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
}
