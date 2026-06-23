"use client";

import type { JDAnalysisResult } from "@/hooks/useJDAnalysis";

type Props = {
  jdText: string;
  onChangeJdText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
  result: JDAnalysisResult | null;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | null;
};

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  Easy:   { color: "var(--success)", bg: "var(--success-bg)" },
  Medium: { color: "var(--warning)", bg: "var(--warning-bg)" },
  Hard:   { color: "var(--danger)",  bg: "var(--danger-bg)" },
  easy:   { color: "var(--success)", bg: "var(--success-bg)" },
  medium: { color: "var(--warning)", bg: "var(--warning-bg)" },
  hard:   { color: "var(--danger)",  bg: "var(--danger-bg)" },
};

export default function JDAnalyzerView({
  jdText,
  onChangeJdText,
  onAnalyze,
  isAnalyzing,
  error,
  result,
  isSaving,
  isSaved,
  saveError,
}: Props) {
  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          📋 Phân tích JD
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Paste Job Description để AI phân tích và sinh câu hỏi phỏng vấn phù hợp
        </p>
      </div>

      {/* Input */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Nội dung Job Description
          </label>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {jdText.length} ký tự
          </span>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => onChangeJdText(e.target.value)}
          rows={10}
          placeholder="Paste toàn bộ nội dung JD vào đây, không cần format..."
          className="w-full text-sm rounded-xl p-4 resize-none focus:outline-none transition-all duration-200"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            color: "var(--foreground)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
        />
        {jdText.length > 0 && jdText.trim().length < 50 && (
          <p className="text-xs mt-2" style={{ color: "var(--warning)" }}>
            ⚠️ Cần ít nhất 50 ký tự để phân tích
          </p>
        )}
      </div>

      {error && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{ color: "var(--danger)", background: "var(--danger-bg)" }}
        >
          {error}
        </p>
      )}

      <button
        onClick={onAnalyze}
        disabled={jdText.trim().length < 50 || isAnalyzing}
        className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
      >
        {isAnalyzing ? (
          <>
            <span
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            Đang phân tích...
          </>
        ) : (
          "🔍 Phân tích JD"
        )}
      </button>

      {result && (
        <div className="space-y-6 animate-fadeInUp">
          {/* Overview */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>
              📊 Tổng quan
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Level */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
                  Level ước tính
                </p>
                <p className="text-base font-bold" style={{ color: "var(--primary-light)" }}>
                  {result.level}
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                  {result.levelReason}
                </p>
              </div>

              {/* Tech stack */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                  Tech stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        color: "var(--primary-light)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Focus skills */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                  Kỹ năng trọng tâm
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.focusSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "var(--surface-hover)",
                        border: "1px solid var(--border-bright)",
                        color: "var(--foreground-2)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--foreground)" }}>
              ❓ Bộ câu hỏi gợi ý
              <span
                className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}
              >
                {result.questions.length} câu
              </span>
            </h2>
            <div className="space-y-2">
              {result.questions.map((q, i) => {
                const diff = DIFFICULTY_STYLE[q.difficulty] ?? { color: "var(--muted)", bg: "var(--surface-hover)" };
                return (
                  <div
                    key={i}
                    className="rounded-xl p-4 flex items-start gap-3 transition-all duration-200 animate-fadeIn"
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
                    }
                  >
                    <span
                      className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm flex-1 leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {q.content}
                    </p>
                    <div className="flex gap-1.5 shrink-0 flex-col items-end">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "var(--info-bg)", color: "var(--info)" }}
                      >
                        {q.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: diff.bg, color: diff.color }}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--foreground)" }}>
              💻 Bài tập coding gợi ý
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {result.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 animate-fadeIn"
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderLeft: "3px solid var(--primary)",
                  }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    {ex.title}
                  </p>
                  <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>
                    {ex.description}
                  </p>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "var(--primary-light)",
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    {ex.language}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save status */}
          {(isSaving || isSaved || saveError) && (
            <div
              className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: isSaved ? "var(--success-bg)" : "var(--surface)",
                border: `1px solid ${isSaved ? "var(--success)" : "var(--border)"}20`,
                color: isSaved ? "var(--success)" : saveError ? "var(--danger)" : "var(--muted)",
              }}
            >
              {isSaving && (
                <>
                  <span
                    className="w-4 h-4 border-2 border-t-transparent rounded-full"
                    style={{ animation: "spin 0.8s linear infinite", borderColor: "var(--muted) transparent transparent" }}
                  />
                  Đang lưu vào lịch sử...
                </>
              )}
              {isSaved && "✅ Đã lưu vào lịch sử."}
              {saveError && `Lỗi lưu: ${saveError}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}