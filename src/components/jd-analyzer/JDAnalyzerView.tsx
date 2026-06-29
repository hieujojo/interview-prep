"use client";

import CVJDMatchView from "./CVJDMatchView";
import EmailDraftModal from "./EmailDraftModal";
import { useJDAnalyzerView } from "@/hooks/useJDAnalyzerView";
import { useState } from "react";
import { createPortal } from "react-dom";

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  "Cơ bản": { color: "var(--success)", bg: "var(--success-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  "Nâng cao": { color: "var(--danger)", bg: "var(--danger-bg)" },
  Easy: { color: "var(--success)", bg: "var(--success-bg)" },
  Medium: { color: "var(--warning)", bg: "var(--warning-bg)" },
  Hard: { color: "var(--danger)", bg: "var(--danger-bg)" },
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  Cao: { color: "var(--danger)", bg: "var(--danger-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  Thấp: { color: "var(--success)", bg: "var(--success-bg)" },
};

const TECH_MATURITY_COLOR: Record<string, string> = {
  Startup: "var(--warning)",
  "Scale-up": "var(--info)",
  Enterprise: "var(--success)",
};

const JD_CRITERIA = [
  { icon: "🎯", label: "Kỹ năng cốt lõi", desc: "Công nghệ, framework bắt buộc được nhấn mạnh trong JD" },
  { icon: "📅", label: "Số năm kinh nghiệm", desc: "Yêu cầu kinh nghiệm tổng thể và theo từng mảng" },
  { icon: "🏗️", label: "Trách nhiệm công việc", desc: "Scope công việc, độ phức tạp của hệ thống cần xây dựng" },
  { icon: "🏢", label: "Môi trường & Văn hóa", desc: "Startup / Scale-up / Enterprise, Remote / Hybrid / On-site" },
];

const JD_OUTPUTS = [
  { icon: "📊", label: "Level ước tính", desc: "Junior / Mid / Senior / Lead dựa trên yêu cầu JD" },
  { icon: "💰", label: "Mức lương", desc: "Ước tính theo thị trường Việt Nam" },
  { icon: "❓", label: "Bộ câu hỏi", desc: "15–20 câu Technical, System Design, Behavioral" },
  { icon: "💻", label: "Bài tập Coding", desc: "2–3 bài mini phù hợp với tech stack JD" },
  { icon: "📚", label: "Lộ trình học", desc: "Ưu tiên theo kỹ năng còn thiếu so với JD" },
];

function JDRubricPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v: boolean) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-bold transition-all"
        style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "var(--primary)" }}
      >
        <span className="flex items-center gap-2"><span>🤖</span> AI phân tích JD như thế nào?</span>
        <span className="text-xs transition-transform duration-200" style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl p-5 space-y-4 animate-fadeIn"
          style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.2)" }}>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Tiêu chí đọc JD</p>
            <div className="space-y-3 pt-1">
              {JD_CRITERIA.map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Kết quả bạn nhận được</p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {JD_OUTPUTS.map(({ icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <span className="text-base shrink-0">{icon}</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted">— {desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JDAnalyzerView() {
  const {
    jdText, handleChangeJdText, analyze,
    result, isAnalyzing, error,
    isSaving, isSaved, saveError,
    activeTab, setActiveTab,
    isUploading, fileInputRef, triggerJDUpload, handleFileUpload,
    cvFileRef, triggerCVUpload, handleCvUploadForMatch,
    matchCvText, setMatchCvText, hasSavedCV, uploadError, setUploadError,
    matchResult, isMatching, matchError, showMatchModal, openMatchModal, closeMatchModal, handleMatch,
    showEmailModal, draft, isGenerating, emailError, generate, openEmailModal, closeEmailModal,
  } = useJDAnalyzerView();

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      {uploadError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl animate-fadeInUp"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <span className="text-base shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-xs font-bold mb-0.5" style={{ color: "var(--danger)" }}>File không hợp lệ</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              File này có vẻ không phải là JD. Vui lòng thử lại với file PDF/DOCX chứa nội dung Job Description.
            </p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-extrabold mb-1" style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}>
          📋 Phân tích JD
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Paste Job Description để AI phân tích sâu và sinh câu hỏi phỏng vấn phù hợp
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
          <label className="text-sm font-semibold flex items-center gap-3" style={{ color: "var(--foreground)" }}>
            Nội dung Job Description
            <input type="file" accept=".pdf,.docx,.doc" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button
              onClick={triggerJDUpload}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              style={{ background: "var(--primary-bg)", color: "var(--primary)", border: "1px solid var(--primary-light)" }}
            >
              {isUploading ? "⏳ Đang đọc..." : "📁 Tải lên (PDF/DOCX)"}
            </button>
          </label>
          <span className="text-xs" style={{ color: "var(--muted)" }}>{jdText.length} ký tự</span>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => handleChangeJdText(e.target.value)}
          rows={10}
          placeholder="Paste toàn bộ nội dung JD vào đây, không cần format..."
          className="w-full text-sm rounded-xl p-4 resize-none focus:outline-none transition-all duration-200"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)", color: "var(--foreground)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
        />
        {jdText.length > 0 && jdText.trim().length < 50 && (
          <p className="text-xs mt-2" style={{ color: "var(--warning)" }}>⚠️ Cần ít nhất 50 ký tự để phân tích</p>
        )}
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
          {error}
        </p>
      )}

      <JDRubricPanel />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={analyze}
          disabled={jdText.trim().length < 50 || isAnalyzing}
          className="btn-gradient w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
              Đang phân tích JD...
            </>
          ) : (
            "🔍 Phân tích JD"
          )}
        </button>

        {result && (
          <>
            <button
              onClick={openMatchModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: "rgba(96,165,250,0.12)", color: "var(--info)", border: "1px solid rgba(96,165,250,0.3)" }}
            >
              🔗 Kết hợp với CV
            </button>
            <button
              onClick={openEmailModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: "rgba(52,211,153,0.12)", color: "var(--success)", border: "1px solid rgba(52,211,153,0.3)" }}
            >
              ✉️ Viết Email
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeInUp">
          {/* Overview */}
          <div className="rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))", border: "1px solid rgba(139,92,246,0.2)" }}>
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>📊 Tổng quan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Level ước tính</p>
                <p className="text-base font-bold" style={{ color: "var(--primary-light)" }}>{result.level}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--foreground-2)" }}>{result.levelReason}</p>
              </div>

              <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Tech stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--primary-light)" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Kỹ năng trọng tâm</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.focusSkills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "var(--surface-hover)", border: "1px solid var(--border-bright)", color: "var(--foreground-2)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {result.salaryRange && (
              <div className="mt-4 rounded-xl p-4 flex items-center gap-4"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <span style={{ fontSize: 28 }}>💰</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Mức lương ước tính</p>
                  <p className="text-base font-bold" style={{ color: "var(--success)" }}>
                    {result.salaryRange.min.toLocaleString()} – {result.salaryRange.max.toLocaleString()} {result.salaryRange.currency}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{result.salaryRange.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
            {(["questions", "company", "roadmap"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={{
                  color: activeTab === tab ? "var(--primary-light)" : "var(--muted)",
                  borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                {tab === "questions" ? "❓ Câu hỏi & Bài tập" : tab === "company" ? "🏢 Về công ty" : "📚 Lộ trình học"}
              </button>
            ))}
          </div>

          {/* Questions & Exercises Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-base font-bold mb-3" style={{ color: "var(--foreground)" }}>
                  ❓ Bộ câu hỏi gợi ý
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}>
                    {result.questions.length} câu
                  </span>
                </h2>
                <div className="space-y-2">
                  {result.questions.map((q, i) => {
                    const diff = DIFFICULTY_STYLE[q.difficulty] ?? { color: "var(--muted)", bg: "var(--surface-hover)" };
                    return (
                      <div key={i}
                        className="rounded-xl p-4 flex items-start gap-3 transition-all duration-200 animate-fadeIn"
                        style={{ animationDelay: `${i * 0.04}s`, background: "var(--surface)", border: "1px solid var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      >
                        <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm flex-1 leading-relaxed" style={{ color: "var(--foreground)" }}>{q.content}</p>
                        <div className="flex gap-1.5 shrink-0 flex-col items-end">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: "var(--info-bg)", color: "var(--info)" }}>
                            {q.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: diff.bg, color: diff.color }}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold mb-3" style={{ color: "var(--foreground)" }}>💻 Bài tập coding gợi ý</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.exercises.map((ex, i) => (
                    <div key={i} className="rounded-xl p-4 animate-fadeIn"
                      style={{ animationDelay: `${i * 0.06}s`, background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--primary)" }}>
                      <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{ex.title}</p>
                      <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>{ex.description}</p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)", border: "1px solid rgba(139,92,246,0.2)" }}>
                        {ex.language}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <div className="space-y-4 animate-fadeIn">
              {result.companyAnalysis ? (
                <>
                  {result.companyName && (
                    <div className="rounded-2xl p-5"
                      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Công ty</p>
                      <p className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>{result.companyName}</p>
                      {result.companyAnalysis.techMaturity && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: `${TECH_MATURITY_COLOR[result.companyAnalysis.techMaturity]}22`,
                            color: TECH_MATURITY_COLOR[result.companyAnalysis.techMaturity],
                            border: `1px solid ${TECH_MATURITY_COLOR[result.companyAnalysis.techMaturity]}44`,
                          }}>
                          {result.companyAnalysis.techMaturity}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <p className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>🌍 Văn hóa & Môi trường</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-2)" }}>{result.companyAnalysis.culture}</p>
                      {result.companyAnalysis.workStyle && (
                        <p className="text-xs mt-2 px-2 py-1 rounded inline-block"
                          style={{ background: "var(--surface-2)", color: "var(--primary-light)" }}>
                          📍 {result.companyAnalysis.workStyle}
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <p className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>🏗 Kỹ thuật</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-2)" }}>{result.companyAnalysis.environment}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {result.companyAnalysis.pros?.length > 0 && (
                      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid rgba(52,211,153,0.2)" }}>
                        <p className="text-xs font-bold mb-3" style={{ color: "var(--success)" }}>✅ Điểm tích cực</p>
                        {result.companyAnalysis.pros.map((p, i) => (
                          <p key={i} className="text-sm mb-2" style={{ color: "var(--foreground-2)" }}>• {p}</p>
                        ))}
                      </div>
                    )}
                    {result.companyAnalysis.cons?.length > 0 && (
                      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid rgba(251,191,36,0.2)" }}>
                        <p className="text-xs font-bold mb-3" style={{ color: "var(--warning)" }}>⚠️ Lưu ý</p>
                        {result.companyAnalysis.cons.map((c, i) => (
                          <p key={i} className="text-sm mb-2" style={{ color: "var(--foreground-2)" }}>• {c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                  <p style={{ fontSize: 48 }}>🏢</p>
                  <p className="mt-2 text-sm">Không có đủ thông tin để phân tích công ty từ JD này</p>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === "roadmap" && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Lộ trình học tập được gợi ý dựa trên tech stack và yêu cầu của JD
              </p>
              {result.learningRoadmap?.length > 0 ? (
                result.learningRoadmap.map((item, i) => {
                  const style = PRIORITY_STYLE[item.priority] ?? { color: "var(--muted)", bg: "var(--surface)" };
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}55` }}>
                          {i + 1}
                        </div>
                        {i < result.learningRoadmap.length - 1 && (
                          <div className="w-0.5 flex-1 mt-1" style={{ background: "var(--border)", minHeight: 24 }} />
                        )}
                      </div>
                      <div className="flex-1 pb-3 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.skill}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: style.bg, color: style.color }}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{item.reason}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                  <p style={{ fontSize: 48 }}>📚</p>
                  <p className="mt-2 text-sm">Không có gợi ý lộ trình học</p>
                </div>
              )}
            </div>
          )}

          {/* Save status */}
          {(isSaving || isSaved || saveError) && (
            <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: isSaved ? "var(--success-bg)" : "var(--surface)",
                border: `1px solid ${isSaved ? "var(--success)" : "var(--border)"}20`,
                color: isSaved ? "var(--success)" : saveError ? "var(--danger)" : "var(--muted)",
              }}>
              {isSaving && (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent rounded-full"
                    style={{ animation: "spin 0.8s linear infinite", borderColor: "var(--muted) transparent transparent" }} />
                  Đang lưu vào lịch sử...
                </>
              )}
              {isSaved && "✅ Đã lưu vào lịch sử."}
              {saveError && `Lỗi lưu: ${saveError}`}
            </div>
          )}
        </div>
      )}

      {/* CV-JD Match Modal */}
      {showMatchModal && !matchResult && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && closeMatchModal()}
        >
          <div className="w-full max-w-lg rounded-2xl p-6 animate-scaleIn space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>🔗 Kết hợp CV + JD</h2>
              <button onClick={closeMatchModal}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}>✕</button>
            </div>

            {hasSavedCV ? (
              <div className="rounded-xl p-4"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>✅ Đã tìm thấy CV từ trang Hồ Sơ</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  CV đã được tải sẵn. Nhấn "Phân tích" để bắt đầu so sánh.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Chưa có CV trong hồ sơ. Upload CV hoặc paste text dưới đây:
                </p>
                <input type="file" accept=".pdf,.docx,.doc" className="hidden" ref={cvFileRef} onChange={handleCvUploadForMatch} />
                <button onClick={triggerCVUpload}
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "var(--primary-bg)", color: "var(--primary)", border: "1px solid var(--primary)" }}>
                  📁 Upload CV (PDF/DOCX)
                </button>
                <textarea
                  value={matchCvText}
                  onChange={(e) => setMatchCvText(e.target.value)}
                  rows={5}
                  placeholder="Hoặc paste text CV vào đây..."
                  className="w-full text-sm rounded-xl p-3 resize-none focus:outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
                />
              </div>
            )}

            {matchError && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
                {matchError}
              </p>
            )}

            <button
              onClick={handleMatch}
              disabled={!matchCvText || isMatching}
              className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
            >
              {isMatching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    style={{ animation: "spin 0.8s linear infinite" }} />
                  Đang phân tích...
                </>
              ) : "🔍 Phân tích mức độ phù hợp"}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* CV-JD Match Result Modal */}
      {showMatchModal && matchResult && (
        <CVJDMatchView result={matchResult} onClose={closeMatchModal} />
      )}

      {/* Email Draft Modal */}
      {showEmailModal && (
        <EmailDraftModal
          jdText={jdText}
          companyName={result?.companyName}
          onClose={closeEmailModal}
          onGenerate={(opts) => generate(jdText, opts)}
          isGenerating={isGenerating}
          draft={draft}
          error={emailError}
          hasSavedCV={hasSavedCV}
          savedCvText={matchCvText}
        />
      )}
    </div>
  );
}