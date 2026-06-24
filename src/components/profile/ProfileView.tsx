"use client";

import { useState, useRef, useEffect } from "react";
import type {
  CVAnalysisResult,
  CVInterviewQuestion,
  CVLearningRecommendation,
} from "@/hooks/useCVAnalysis";

type Props = {
  cvText: string;
  onChangeCvText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
  result: CVAnalysisResult | null;
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  Cao: { color: "var(--danger)", bg: "var(--danger-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  Thấp: { color: "var(--success)", bg: "var(--success-bg)" },
};

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  "Cơ bản": { color: "var(--success)", bg: "var(--success-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  "Nâng cao": { color: "var(--danger)", bg: "var(--danger-bg)" },
};

const CATEGORY_ICON: Record<string, string> = {
  Skill: "⚡",
  Project: "🚀",
  Experience: "💼",
  Behavioral: "🧠",
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: "rotate(90deg) translate(0, -100%)", fill: color, fontSize: 16, fontWeight: 800 }}
      >
      </text>
    </svg>
  );
}

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div
        style={{
          width: `${(value / max) * 100}%`,
          height: "100%",
          background: color,
          borderRadius: 4,
          transition: "width 1s ease-out",
        }}
      />
    </div>
  );
}

export default function ProfileView({
  cvText, onChangeCvText, onAnalyze, isAnalyzing, error, result,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "learning">("overview");
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/parse-file", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi đọc file");
      onChangeCvText(data.text);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as any;
    handleFileUpload(fakeEvent);
  };

  const copyQuestion = (q: CVInterviewQuestion, idx: number) => {
    navigator.clipboard.writeText(q.content);
    setCopiedQuestion(idx);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const score = result?.overallScore?.score ?? 0;
  const scoreColor =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold mb-1" style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}>
          👤 Hồ Sơ Cá Nhân
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Upload CV để AI phân tích điểm mạnh, điểm yếu và sinh câu hỏi phỏng vấn cá nhân hóa
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-2xl p-6 transition-all duration-200"
        style={{
          background: "var(--surface)",
          border: "2px dashed var(--border-bright)",
        }}
        onDragEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onDragLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Nội dung CV
          </label>
          <div className="flex items-center gap-2">
            <input type="file" accept=".pdf,.docx,.doc" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              style={{ background: "var(--primary-bg)", color: "var(--primary)", border: "1px solid var(--primary)" }}
            >
              {isUploading ? "⏳ Đang đọc..." : "📁 Tải lên PDF/DOCX"}
            </button>
            {cvText && (
              <button
                onClick={() => onChangeCvText("")}
                className="px-2 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
              >
                ✕ Xóa
              </button>
            )}
          </div>
        </div>

        {!cvText ? (
          <div
            className="flex flex-col items-center justify-center py-10 gap-3 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <span style={{ fontSize: 48 }}>📄</span>
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Kéo thả file hoặc click để upload CV
            </p>
            <p className="text-xs" style={{ color: "var(--muted-2)" }}>
              Hỗ trợ PDF, DOCX, DOC — hoặc paste trực tiếp vào bên dưới
            </p>
          </div>
        ) : (
          <textarea
            value={cvText}
            onChange={(e) => onChangeCvText(e.target.value)}
            rows={8}
            placeholder="Paste nội dung CV vào đây..."
            className="w-full text-sm rounded-xl p-4 resize-none focus:outline-none transition-all duration-200"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-bright)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
          />
        )}

        {!cvText && (
          <textarea
            value={cvText}
            onChange={(e) => onChangeCvText(e.target.value)}
            rows={4}
            placeholder="...hoặc paste text CV trực tiếp vào đây"
            className="w-full text-sm rounded-xl p-4 resize-none focus:outline-none transition-all duration-200 mt-3"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {cvText.length} ký tự
          </span>
          {cvText.length > 0 && cvText.trim().length < 100 && (
            <p className="text-xs" style={{ color: "var(--warning)" }}>
              ⚠️ Cần ít nhất 100 ký tự để phân tích
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
          {error}
        </p>
      )}

      {/* Info: Evaluation Criteria */}
      <div className="rounded-xl p-4 flex gap-3 items-start" style={{ background: "rgba(139,92,246,0.05)", border: "1px dashed rgba(139,92,246,0.3)" }}>
        <span className="text-lg">🤖</span>
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: "var(--primary-light)" }}>Tiêu chí đánh giá của AI (Thang điểm 100)</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Hồ sơ của bạn được phân tích toàn diện dựa trên 4 yếu tố chính: <b>Kỹ thuật chuyên sâu</b> (Technical Depth), <b>Sức ảnh hưởng của dự án</b> (Project Impact), <b>Bề dày kinh nghiệm</b> (Experience), và <b>Cách trình bày CV</b> (Presentation). 
            <br className="mb-1"/>
            Mức độ đánh giá: <b>Junior</b> (Thực tập/Mới ra trường), <b>Mid-level</b> (Có kinh nghiệm độc lập), <b>Senior</b> (Chuyên gia/Thiết kế hệ thống).
          </p>
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={cvText.trim().length < 100 || isAnalyzing}
        className="btn-gradient w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
      >
        {isAnalyzing ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
            Đang phân tích CV...
          </>
        ) : (
          "🔍 Phân tích CV"
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeInUp">
          {/* Score Banner */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Score Ring */}
              <div className="relative flex-shrink-0">
                <ScoreRing score={score} size={100} />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: scoreColor, fontWeight: 800, fontSize: 22 }}
                >
                  {score}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
                    {result.name || "Ứng viên"}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(139,92,246,0.15)", color: "var(--primary-light)", border: "1px solid rgba(139,92,246,0.3)" }}
                  >
                    {result.currentLevel}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--foreground-2)" }}>
                  {result.levelReason}
                </p>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Kỹ thuật", val: result.overallScore.breakdown.technicalDepth, color: "var(--primary)" },
                    { label: "Dự án", val: result.overallScore.breakdown.projectImpact, color: "var(--info)" },
                    { label: "Kinh nghiệm", val: result.overallScore.breakdown.experience, color: "var(--success)" },
                    { label: "Trình bày", val: result.overallScore.breakdown.presentation, color: "var(--warning)" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{item.label}</span>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.val}</span>
                      </div>
                      <MiniBar value={item.val} color={item.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--foreground-2)" }}>
              💬 {result.overallScore.summary}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
            {(["overview", "questions", "learning"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-200 relative"
                style={{
                  color: activeTab === tab ? "var(--primary-light)" : "var(--muted)",
                  borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                {tab === "overview" ? "📊 Tổng quan" : tab === "questions" ? "❓ Câu hỏi" : "📚 Học thêm"}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Skills */}
              <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>⚡ Kỹ năng</h3>
                <div className="space-y-3">
                  {[
                    { label: "Kỹ thuật", items: result.skills.technical, color: "rgba(139,92,246,0.15)", textColor: "var(--primary-light)" },
                    { label: "Công cụ", items: result.skills.tools, color: "rgba(96,165,250,0.15)", textColor: "var(--info)" },
                    { label: "Kỹ năng mềm", items: result.skills.soft, color: "rgba(52,211,153,0.15)", textColor: "var(--success)" },
                  ].map(({ label, items, color, textColor }) =>
                    items?.length ? (
                      <div key={label}>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((item) => (
                            <span key={item} className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: color, color: textColor, border: `1px solid ${textColor}33` }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--success)" }}>✅ Điểm mạnh</h3>
                  <div className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="pl-3" style={{ borderLeft: "2px solid var(--success)" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{s.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: "var(--warning)" }}>⚠️ Cần cải thiện</h3>
                  <div className="space-y-3">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="pl-3" style={{ borderLeft: "2px solid var(--warning)" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{w.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{w.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience */}
              {result.experience?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>💼 Kinh nghiệm</h3>
                  <div className="space-y-4">
                    {result.experience.map((exp, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--primary)" }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{exp.role}</p>
                          <p className="text-xs" style={{ color: "var(--primary-light)" }}>{exp.company} · {exp.duration}</p>
                          <ul className="mt-1.5 space-y-1">
                            {exp.highlights?.map((h, hi) => (
                              <li key={hi} className="text-xs" style={{ color: "var(--muted)" }}>• {h}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {result.projects?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>🚀 Dự án</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.projects.map((proj, i) => (
                      <div key={i} className="rounded-xl p-4"
                        style={{ background: "var(--surface-2)", borderLeft: "3px solid var(--primary)" }}>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{proj.name}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{proj.description}</p>
                        {proj.impact && (
                          <p className="text-xs mt-1 font-medium" style={{ color: "var(--success)" }}>🎯 {proj.impact}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.tech?.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-xs"
                              style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Các câu hỏi được sinh dựa trực tiếp từ nội dung CV của bạn
              </p>
              {result.interviewQuestions.map((q, i) => {
                const diff = DIFFICULTY_STYLE[q.difficulty] ?? { color: "var(--muted)", bg: "var(--surface)" };
                return (
                  <div key={i} className="rounded-xl p-4 flex items-start gap-3 transition-all duration-200"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <span className="text-lg flex-shrink-0">{CATEGORY_ICON[q.category] ?? "❓"}</span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{q.content}</p>
                      {q.context && (
                        <p className="text-xs mt-1.5 italic" style={{ color: "var(--muted)" }}>
                          📌 {q.context}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "var(--info-bg)", color: "var(--info)" }}>
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: diff.bg, color: diff.color }}>
                        {q.difficulty}
                      </span>
                      <button
                        onClick={() => copyQuestion(q, i)}
                        className="text-xs px-2 py-0.5 rounded transition-colors"
                        style={{ color: copiedQuestion === i ? "var(--success)" : "var(--muted)", background: "var(--surface-2)" }}
                      >
                        {copiedQuestion === i ? "✓ Đã chép" : "📋 Copy"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Learning Tab */}
          {activeTab === "learning" && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Gợi ý học thêm dựa trên phân tích CV hiện tại của bạn
              </p>
              {result.learningRecommendations.map((rec, i) => {
                const style = PRIORITY_STYLE[rec.priority] ?? { color: "var(--muted)", bg: "var(--surface)" };
                return (
                  <div key={i} className="rounded-xl p-5 transition-all duration-200"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📚</span>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{rec.skill}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ background: style.bg, color: style.color }}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted)" }}>{rec.reason}</p>
                    {rec.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rec.resources.map((r, ri) => (
                          <span key={ri} className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "var(--surface-2)", color: "var(--foreground-2)", border: "1px solid var(--border-bright)" }}>
                            🔗 {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
