/* ─────────────────────────────────────────
   pages/CreateProject/index.jsx

   API:  POST /api/projects  (multipart/form-data)
   Parts:
     · "request" (JSON Blob) — title, content, categoryId,
                               goalAmount, startAt, deadline, thumbnailIndex
     · "images"  (File[])    — 이미지 배열 (최대 5장, 각 20MB)
───────────────────────────────────────── */
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { createProject } from "../../api/projects";
import { getCategories } from "../../api/categories";
import styles from "./CreateProject.module.css";

const STEPS = ["기본 정보", "프로젝트 스토리", "펀딩 설정", "이미지 & 미리보기"];

export default function CreateProject() {
  const navigate  = useNavigate();
  const editorRef = useRef();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    title:          "",
    categoryId:     "",
    goalAmount:     "",
    startAt:        "",   // datetime-local 값 "YYYY-MM-DDTHH:mm"
    deadline:       "",
    thumbnailIndex: 0,
  });

  const [images,     setImages]     = useState([]);  // File[]
  const [previews,   setPreviews]   = useState([]);  // ObjectURL[]
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [content, setContent] = useState("");

  /* 카테고리 로드 */
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  /* 이미지 미리보기 URL */
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [images]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (form.thumbnailIndex >= idx && form.thumbnailIndex > 0)
      set("thumbnailIndex", form.thumbnailIndex - 1);
  };

  /* 단계별 필수 조건 */
  const canNext = [
    !!(form.title.trim() && form.categoryId),
    true,
    !!(form.goalAmount && form.startAt && form.deadline &&
       new Date(form.startAt) < new Date(form.deadline)),
    images.length > 0,
  ];

  const validate = () => {
    if (!form.title.trim())    return "제목을 입력해주세요.";
    if (!form.categoryId)      return "카테고리를 선택해주세요.";
    if (!form.goalAmount || Number(form.goalAmount) <= 0)
                               return "올바른 목표 금액을 입력해주세요.";
    if (!form.startAt)         return "펀딩 시작일을 설정해주세요.";
    if (!form.deadline)        return "펀딩 마감일을 설정해주세요.";
    if (new Date(form.startAt) >= new Date(form.deadline))
                               return "마감일은 시작일보다 늦어야 합니다.";
    if (images.length === 0)   return "이미지를 최소 1장 업로드해주세요.";
    return null;
  };

  const handleSubmit = async () => {
    const validErr = validate();
    if (validErr) { setError(validErr); return; }

    setError("");
    setSubmitting(true);
    try {
      const request = {
        title:          form.title.trim(),
        content,
        categoryId:     Number(form.categoryId),
        goalAmount:     Number(form.goalAmount),
        startAt:        form.startAt + ":00",    // LocalDateTime 형식
        deadline:       form.deadline + ":00",
        thumbnailIndex: form.thumbnailIndex,
      };
      const projectId = await createProject(request, images);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.message ?? "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const durationDays = form.startAt && form.deadline
    ? Math.ceil((new Date(form.deadline) - new Date(form.startAt)) / 86400000)
    : null;

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
                  ${i < step  ? styles.stepDone    : ""}
                  ${i > step  ? styles.stepFuture  : ""}`}
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

          {/* ── STEP 0: 기본 정보 ── */}
          {step === 0 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>기본 정보</h2>
                <p className={styles.sectionDesc}>프로젝트의 제목과 카테고리를 설정해주세요.</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  프로젝트 제목 <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  placeholder="한눈에 이해할 수 있는 명확한 제목을 입력해주세요"
                  value={form.title}
                  maxLength={100}
                  onChange={(e) => set("title", e.target.value)}
                />
                <div className={styles.inputMeta}>
                  <span className={styles.hint}>프로젝트를 잘 설명하는 제목일수록 후원자 관심이 높아집니다</span>
                  <span className={styles.charCount}>{form.title.length}/100</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  카테고리 <span className={styles.req}>*</span>
                </label>
                <div className={styles.catGrid}>
                  {categories.length > 0
                    ? categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`${styles.catChip} ${form.categoryId == cat.id ? styles.catChipOn : ""}`}
                          onClick={() => set("categoryId", cat.id)}
                        >
                          {cat.name}
                        </button>
                      ))
                    : (
                        <select
                          className={styles.select}
                          value={form.categoryId}
                          onChange={(e) => set("categoryId", e.target.value)}
                        >
                          <option value="">카테고리 선택</option>
                        </select>
                      )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: 스토리 ── */}
          {step === 1 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>프로젝트 스토리</h2>
                <p className={styles.sectionDesc}>후원자들이 프로젝트에 공감할 수 있도록 스토리를 작성해주세요.</p>
              </div>
              <div className={styles.editorWrap}>
                <Editor
                  ref={editorRef}
                  height="520px"
                  initialEditType="wysiwyg"
                  previewStyle="vertical"
                  initialValue=" "  
                  placeholder="프로젝트 소개, 제작 배경, 리워드 상세, 제작팀 소개 등을 작성해주세요..."
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
                <p className={styles.sectionDesc}>목표 금액과 펀딩 기간을 설정해주세요.</p>
              </div>

              {/* 목표 금액 */}
              <div className={styles.field}>
                <label className={styles.label}>
                  목표 금액 <span className={styles.req}>*</span>
                </label>
                <div className={styles.amountRow}>
                  <input
                    className={`${styles.input} ${styles.amountInput}`}
                    type="number"
                    min={10000}
                    step={10000}
                    placeholder="0"
                    value={form.goalAmount}
                    onChange={(e) => set("goalAmount", e.target.value)}
                  />
                  <span className={styles.amountUnit}>원</span>
                </div>
                {form.goalAmount > 0 && (
                  <p className={styles.amountPreview}>
                    = {Number(form.goalAmount).toLocaleString()}원
                  </p>
                )}
              </div>

              {/* 날짜 */}
              <div className={styles.field}>
                <label className={styles.label}>
                  펀딩 기간 <span className={styles.req}>*</span>
                </label>
                <div className={styles.dateRow}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateTag}>시작</span>
                    <input
                      className={styles.input}
                      type="datetime-local"
                      value={form.startAt}
                      onChange={(e) => set("startAt", e.target.value)}
                    />
                  </div>
                  <span className={styles.dateArrow}>→</span>
                  <div className={styles.dateItem}>
                    <span className={styles.dateTag}>마감</span>
                    <input
                      className={styles.input}
                      type="datetime-local"
                      value={form.deadline}
                      min={form.startAt}
                      onChange={(e) => set("deadline", e.target.value)}
                    />
                  </div>
                </div>

                {durationDays !== null && durationDays > 0 && (
                  <div className={styles.durationChip}>
                    📅 총 {durationDays}일간 진행
                  </div>
                )}
                {durationDays !== null && durationDays <= 0 && (
                  <p className={styles.dateError}>마감일은 시작일보다 늦어야 합니다.</p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: 이미지 & 미리보기 ── */}
          {step === 3 && (
            <div>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>이미지 업로드</h2>
                <p className={styles.sectionDesc}>
                  최소 1장 · 최대 5장 업로드 가능합니다. <strong>★</strong>를 클릭해 대표 이미지를 선택하세요.
                </p>
              </div>

              {images.length < 5 && (
                <label className={styles.dropzone}>
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageAdd} />
                  <span className={styles.dropIcon}>🖼</span>
                  <span className={styles.dropText}>클릭하여 이미지 추가</span>
                  <span className={styles.dropSub}>JPG · PNG · GIF — 파일당 최대 20MB · 현재 {images.length}/5</span>
                </label>
              )}

              {previews.length > 0 && (
                <div className={styles.imgGrid}>
                  {previews.map((url, i) => (
                    <div
                      key={i}
                      className={`${styles.imgCard} ${i === form.thumbnailIndex ? styles.imgCardThumb : ""}`}
                    >
                      <img src={url} alt="" className={styles.imgThumb} />
                      <div className={styles.imgActions}>
                        <button
                          className={`${styles.btnThumb} ${i === form.thumbnailIndex ? styles.btnThumbOn : ""}`}
                          onClick={() => set("thumbnailIndex", i)}
                          title="대표 이미지"
                        >
                          {i === form.thumbnailIndex ? "★ 대표" : "☆ 대표"}
                        </button>
                        <button className={styles.btnRemove} onClick={() => removeImage(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 요약 */}
              <div className={styles.summary}>
                <h3 className={styles.summaryTitle}>최종 확인</h3>
                <dl className={styles.summaryGrid}>
                  <dt>제목</dt>
                  <dd>{form.title || <em className={styles.empty}>미입력</em>}</dd>
                  <dt>카테고리</dt>
                  <dd>{categories.find((c) => c.id == form.categoryId)?.name || <em className={styles.empty}>미선택</em>}</dd>
                  <dt>목표 금액</dt>
                  <dd>{form.goalAmount ? `${Number(form.goalAmount).toLocaleString()}원` : <em className={styles.empty}>미입력</em>}</dd>
                  <dt>시작일</dt>
                  <dd>{form.startAt?.replace("T", " ") || <em className={styles.empty}>미설정</em>}</dd>
                  <dt>마감일</dt>
                  <dd>{form.deadline?.replace("T", " ") || <em className={styles.empty}>미설정</em>}</dd>
                  <dt>기간</dt>
                  <dd>{durationDays > 0 ? `${durationDays}일` : <em className={styles.empty}>—</em>}</dd>
                  <dt>이미지</dt>
                  <dd>{images.length}장</dd>
                </dl>
              </div>
            </div>
          )}

          {/* ── 에러 ── */}
          {error && <div className={styles.errorBox}>⚠ {error}</div>}

          {/* ── 하단 버튼 ── */}
          <div className={styles.nav}>
            {step > 0
              ? <button className={styles.btnBack} onClick={() => { setError(""); setStep((s) => s - 1); }}>← 이전</button>
              : <div />
            }
            {step < STEPS.length - 1
              ? (
                <button
                  className={`${styles.btnNext} ${!canNext[step] ? styles.btnNextOff : ""}`}
                  onClick={() => {
  if (!canNext[step]) return;
  setError("");
  // 스토리 단계에서 넘어갈 때 content 저장
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
                  {submitting ? "등록 중..." : "🚀 프로젝트 등록"}
                </button>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
}
