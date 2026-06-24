"use client";

import { useState } from "react";
import type { CVJDMatchResult } from "@/hooks/useCVJDMatch";

type Props = {
  result: CVJDMatchResult;
  onClose: () => void;
};

const IMPORTANCE_STYLE: Record<string, { color: string; bg: string }> = {
  "Bắt buộc":      { color: "var(--danger)",  bg: "var(--danger-bg)" },
  "Quan trọng":    { color: "var(--warning)", bg: "var(--warning-bg)" },
  "Tốt nếu có":   { color: "var(--info)",    bg: "var(--info-bg)" },
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  Cao:          { color: "var(--danger)",  bg: "var(--danger-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  Thấp:         { color: "var(--success)", bg: "var(--success-bg)" },
};

function ScoreArc({ score }: { score: number }) {
  const color =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";
  const label =
    score >= 80 ? "Phù hợp tốt" : score >= 60 ? "Phù hợp một phần" : "Chưa phù hợp";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 120, height: 120,
          background: `conic-gradient(${color} ${score * 3.6}deg, var(--surface-2) 0deg)`,
          padding: 8,
        }}
      >
        <div
          className="rounded-full flex flex-col items-center justify-center"
          style={{ width: "100%", height: "100%", background: "var(--surface)" }}
        >
          <span style={{ fontSize: 28, fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: 10, color: "var(--muted)" }}>/ 100</span>
        </div>
      </div>
      <p className="text-sm font-bold mt-2" style={{ color }}>{label}</p>
    </div>
  );
}

export default function CVJDMatchView({ result, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<"match" | "gap" | "path" | "ready">("match");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-5 border-b"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            zIndex: 10,
          }}
        >
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>
              🔗 Kết hợp CV + JD
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Phân tích mức độ phù hợp của CV với Job Description
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score + Verdict */}
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <ScoreArc score={result.matchScore} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-base font-bold mb-2" style={{ color: "var(--foreground)" }}>
                {result.verdict}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                {result.verdictReason}
              </p>
              {result.experienceMatch.gap && (
                <p className="text-xs mt-2 px-3 py-1.5 rounded-lg inline-block"
                  style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                  ⚠️ {result.experienceMatch.gap}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
            {(["match", "gap", "path", "ready"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className="px-3 py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  color: activeSection === tab ? "var(--primary-light)" : "var(--muted)",
                  borderBottom: activeSection === tab ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                {tab === "match" ? "✅ Phù hợp" : tab === "gap" ? "❌ Thiếu" : tab === "path" ? "📚 Lộ trình" : "🎯 Sẵn sàng"}
              </button>
            ))}
          </div>

          {/* Matched Skills */}
          {activeSection === "match" && (
            <div className="space-y-2 animate-fadeIn">
              {result.matchedSkills.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>Không có kỹ năng phù hợp trực tiếp</p>
              ) : (
                result.matchedSkills.map((s, i) => (
                  <div key={i} className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: "var(--surface-2)", border: "1px solid rgba(52,211,153,0.2)" }}>
                    <span className="text-base">✅</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{s.skill}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>CV: {s.level}</span>
                        <span style={{ color: "var(--border-bright)" }}>·</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>JD yêu cầu: {s.required}</span>
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--success-bg)" }}>
                      <span style={{ color: "var(--success)", fontSize: 10 }}>✓</span>
                    </span>
                  </div>
                ))
              )}
              {result.surplusSkills?.length > 0 && (
                <div className="rounded-xl p-4 mt-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
                    🌟 Kỹ năng bổ sung (không có trong JD nhưng là điểm cộng)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.surplusSkills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: "rgba(96,165,250,0.12)", color: "var(--info)", border: "1px solid rgba(96,165,250,0.2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Missing Skills */}
          {activeSection === "gap" && (
            <div className="space-y-2 animate-fadeIn">
              {result.missingSkills.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--success)" }}>
                  🎉 CV của bạn đáp ứng đầy đủ yêu cầu JD!
                </p>
              ) : (
                result.missingSkills.map((s, i) => {
                  const style = IMPORTANCE_STYLE[s.importance] ?? { color: "var(--muted)", bg: "var(--surface)" };
                  return (
                    <div key={i} className="rounded-xl p-4 flex items-start gap-3"
                      style={{ background: "var(--surface-2)", border: `1px solid ${style.color}33` }}>
                      <span className="text-base flex-shrink-0">❌</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{s.skill}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: style.bg, color: style.color }}>
                            {s.importance}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{s.description}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {result.suggestions?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>💡 Gợi ý cải thiện</p>
                  {result.suggestions.map((s, i) => {
                    const style = PRIORITY_STYLE[s.priority] ?? { color: "var(--muted)", bg: "var(--surface)" };
                    return (
                      <div key={i} className="rounded-xl p-4"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{s.area}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: style.bg, color: style.color }}>{s.priority}</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{s.action}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--primary-light)" }}>⏱ {s.timeline}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Learning Path */}
          {activeSection === "path" && (
            <div className="space-y-3 animate-fadeIn">
              {result.learningPath.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(139,92,246,0.15)", color: "var(--primary-light)", border: "1px solid rgba(139,92,246,0.3)" }}>
                      {i + 1}
                    </div>
                    {i < result.learningPath.length - 1 && (
                      <div className="w-0.5 flex-1 mt-1" style={{ background: "var(--border)", minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.skill}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.why}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--foreground-2)" }}>📖 {item.howToLearn}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--primary-light)" }}>⏱ {item.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interview Readiness */}
          {activeSection === "ready" && result.interviewReadiness && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-4 rounded-xl p-4"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="text-3xl font-extrabold"
                  style={{ color: result.interviewReadiness.score >= 70 ? "var(--success)" : "var(--warning)" }}>
                  {result.interviewReadiness.score}%
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Mức độ sẵn sàng phỏng vấn</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Dựa trên mức độ phù hợp CV với JD</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--success)" }}>💪 Điểm tự tin</p>
                  {result.interviewReadiness.strongPoints.map((p, i) => (
                    <p key={i} className="text-xs mb-1.5" style={{ color: "var(--foreground-2)" }}>✓ {p}</p>
                  ))}
                </div>
                <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--warning)" }}>⚠️ Cần chuẩn bị</p>
                  {result.interviewReadiness.weakPoints.map((p, i) => (
                    <p key={i} className="text-xs mb-1.5" style={{ color: "var(--foreground-2)" }}>• {p}</p>
                  ))}
                </div>
              </div>

              {result.interviewReadiness.tips?.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--primary-light)" }}>🎯 Lời khuyên</p>
                  {result.interviewReadiness.tips.map((tip, i) => (
                    <p key={i} className="text-xs mb-1.5" style={{ color: "var(--foreground-2)" }}>→ {tip}</p>
                  ))}
                </div>
              )}

              {result.coverLetterHints?.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--muted)" }}>✉️ Gợi ý cho Cover Letter</p>
                  {result.coverLetterHints.map((hint, i) => (
                    <p key={i} className="text-xs mb-1.5" style={{ color: "var(--foreground-2)" }}>• {hint}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
