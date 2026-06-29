"use client";

import { useState } from "react";
import type { CVJDMatchResult } from "@/hooks/useCVJDMatch";
import { createPortal } from "react-dom";

type Props = {
  result: CVJDMatchResult;
  onClose: () => void;
};

const IMPORTANCE_STYLE: Record<string, { color: string; bg: string }> = {
  "Bắt buộc":    { color: "var(--danger)",  bg: "var(--danger-bg)" },
  "Quan trọng":  { color: "var(--warning)", bg: "var(--warning-bg)" },
  "Tốt nếu có": { color: "var(--info)",    bg: "var(--info-bg)" },
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  Cao:          { color: "var(--danger)",  bg: "var(--danger-bg)" },
  "Trung bình": { color: "var(--warning)", bg: "var(--warning-bg)" },
  Thấp:         { color: "var(--success)", bg: "var(--success-bg)" },
};

const PASS_STYLE: Record<string, { color: string; bg: string }> = {
  "Khó pass":     { color: "var(--danger)",  bg: "var(--danger-bg)" },
  "Có thể pass":  { color: "var(--warning)", bg: "var(--warning-bg)" },
  "Khả năng cao": { color: "var(--info)",    bg: "var(--info-bg)" },
  "Rất cao":      { color: "var(--success)", bg: "var(--success-bg)" },
};

const ROLE_STYLE: Record<string, { color: string; bg: string; icon: string }> = {
  Intern:  { color: "var(--info)",    bg: "var(--info-bg)",    icon: "🎓" },
  Fresher: { color: "var(--warning)", bg: "var(--warning-bg)", icon: "🌱" },
  Junior:  { color: "var(--success)", bg: "var(--success-bg)", icon: "⚡" },
};

const TABS = [
  { id: "match", label: "Phù hợp",   icon: "✅" },
  { id: "gap",   label: "Thiếu",     icon: "❌" },
  { id: "pass",  label: "Pass CV",   icon: "🎯" },
  { id: "path",  label: "Lộ trình",  icon: "📚" },
  { id: "ready", label: "Phỏng vấn", icon: "💬" },
] as const;
type TabId = typeof TABS[number]["id"];

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "var(--success)" :
    score >= 60 ? "var(--warning)" :
    "var(--danger)";
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
          <circle
            cx="55" cy="55" r={r} fill="none"
            stroke={color} strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>Match Score</span>
    </div>
  );
}

function PassMeter({ chance, label }: { chance: number; label: string }) {
  const s = PASS_STYLE[label] ?? PASS_STYLE["Có thể pass"];
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[140px]">
      <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Khả năng pass</span>
      <span style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1 }}>{chance}%</span>
      <span
        className="px-3 py-1 rounded-full text-xs font-bold"
        style={{ background: s.bg, color: s.color }}
      >{label}</span>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${chance}%`, background: s.color, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
      {children}
    </p>
  );
}

function InfoCard({
  children, accent = "var(--border)", style: extraStyle,
}: {
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--surface-2)",
        border: `1px solid ${accent}`,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

export default function CVJDMatchView({ result, onClose }: Props) {
  const [tab, setTab] = useState<TabId>("match");
  const pass = result.cvPassAnalysis;
  const roleStyle = ROLE_STYLE[result.detectedRole ?? "Fresher"] ?? ROLE_STYLE["Fresher"];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-bright)",
          maxHeight: "92vh",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-extrabold" style={{ color: "var(--foreground)" }}>
              Kết hợp CV + JD
            </span>
            {result.detectedRole && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: roleStyle.bg, color: roleStyle.color }}
              >
                {roleStyle.icon} {result.detectedRole}
              </span>
            )}
            {result.detectedMarket && result.detectedMarket !== "Không rõ" && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                📍 {result.detectedMarket}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--muted)", fontSize: 16 }}
          >✕</button>
        </div>

        {/* ── HERO: Score + Pass ── */}
        <div
          className="flex-shrink-0 flex items-center justify-around gap-4 px-6 py-5"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(99,102,241,0.03) 100%)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <ScoreRing score={result.matchScore} />

          {/* Divider */}
          <div className="hidden sm:block self-stretch w-px" style={{ background: "var(--border)" }} />

          {pass && <PassMeter chance={pass.passChance} label={pass.passLabel} />}

          {/* Divider */}
          <div className="hidden sm:block self-stretch w-px" style={{ background: "var(--border)" }} />

          {/* Verdict */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-bold mb-1.5" style={{ color: "var(--foreground)" }}>
              {result.verdict}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
              {result.verdictReason}
            </p>
            {result.experienceMatch?.gap && (
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs"
                style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
              >
                ⚠️ {result.experienceMatch.gap}
              </div>
            )}
          </div>
        </div>

        {/* Verdict mobile */}
        {(result.verdict || result.experienceMatch?.gap) && (
          <div className="sm:hidden flex-shrink-0 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{result.verdict}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>{result.verdictReason}</p>
            {result.experienceMatch?.gap && (
              <div className="mt-2 px-2.5 py-1 rounded-lg text-xs inline-block"
                style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                ⚠️ {result.experienceMatch.gap}
              </div>
            )}
          </div>
        )}

        {/* ── TABS NAV ── */}
        <div
          className="flex-shrink-0 flex border-b overflow-x-auto"
          style={{ borderColor: "var(--border)" }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap flex-1 justify-center"
                style={{
                  color: active ? "var(--primary-light)" : "var(--muted)",
                  borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                  background: active ? "rgba(139,92,246,0.05)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* ── MATCH ── */}
          {tab === "match" && (
            <div className="space-y-3 animate-fadeIn">
              {result.matchedSkills.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>
                  Không có kỹ năng phù hợp trực tiếp
                </p>
              ) : (
                <>
                  <SectionLabel>Kỹ năng khớp với JD ({result.matchedSkills.length})</SectionLabel>
                  {result.matchedSkills.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid rgba(52,211,153,0.18)",
                      }}
                    >
                      <span className="text-base flex-shrink-0">✅</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                          {s.skill}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          CV: {s.level} · JD yêu cầu: {s.required}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {result.surplusSkills?.length > 0 && (
                <InfoCard>
                  <SectionLabel>🌟 Kỹ năng bổ sung (không có trong JD)</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.surplusSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: "rgba(96,165,250,0.12)",
                          color: "var(--info)",
                          border: "1px solid rgba(96,165,250,0.2)",
                        }}
                      >{s}</span>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>
          )}

          {/* ── GAP ── */}
          {tab === "gap" && (
            <div className="space-y-3 animate-fadeIn">
              {result.missingSkills.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "var(--success)" }}>
                  🎉 CV đáp ứng đầy đủ yêu cầu JD!
                </p>
              ) : (
                <>
                  <SectionLabel>Kỹ năng còn thiếu ({result.missingSkills.length})</SectionLabel>
                  {result.missingSkills.map((s, i) => {
                    const st = IMPORTANCE_STYLE[s.importance] ?? { color: "var(--muted)", bg: "var(--surface)" };
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl px-4 py-3"
                        style={{ background: "var(--surface-2)", border: `1px solid ${st.color}33` }}
                      >
                        <span className="text-base flex-shrink-0 mt-0.5">❌</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                              {s.skill}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: st.bg, color: st.color }}
                            >{s.importance}</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                            {s.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {result.suggestions?.length > 0 && (
                <div className="space-y-2 pt-1">
                  <SectionLabel>💡 Gợi ý cải thiện</SectionLabel>
                  {result.suggestions.map((s, i) => {
                    const st = PRIORITY_STYLE[s.priority] ?? { color: "var(--muted)", bg: "var(--surface)" };
                    return (
                      <InfoCard key={i}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{s.area}</p>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                            style={{ background: st.bg, color: st.color }}
                          >{s.priority}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>{s.action}</p>
                        <p className="text-xs mt-1.5" style={{ color: "var(--primary-light)" }}>⏱ {s.timeline}</p>
                      </InfoCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PASS CV ── */}
          {tab === "pass" && pass && (
            <div className="space-y-4 animate-fadeIn">

              {/* HR impression — most important, put first */}
              <InfoCard accent="rgba(139,92,246,0.3)">
                <SectionLabel>👁️ HR nhìn CV này trong 30 giây đầu</SectionLabel>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                  {pass.recruiterFirstImpression}
                </p>
              </InfoCard>

              {/* Why hire / Why reject side by side */}
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoCard accent="rgba(52,211,153,0.2)">
                  <SectionLabel>✅ Lý do được gọi phỏng vấn</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.whyHireThis ?? "Chưa có điểm nổi bật đủ để ưu tiên."}
                  </p>
                </InfoCard>
                <InfoCard accent="rgba(239,68,68,0.2)">
                  <SectionLabel>❌ Lý do có thể bị loại ngay</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.whyReject}
                  </p>
                </InfoCard>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoCard accent="rgba(52,211,153,0.15)">
                  <SectionLabel>💪 Điểm mạnh thực sự</SectionLabel>
                  <ul className="space-y-1.5">
                    {pass.cvStrengths?.map((s, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--foreground-2)" }}>✓ {s}</li>
                    ))}
                  </ul>
                </InfoCard>
                <InfoCard accent="rgba(239,68,68,0.15)">
                  <SectionLabel>⚠️ Điểm yếu cần sửa ngay</SectionLabel>
                  <ul className="space-y-1.5">
                    {pass.cvWeaknesses?.map((s, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--foreground-2)" }}>• {s}</li>
                    ))}
                  </ul>
                </InfoCard>
              </div>

              {/* Competitor comparison */}
              <InfoCard>
                <SectionLabel>📊 Vị trí trong pool ứng viên</SectionLabel>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                  {pass.competitorComparison}
                </p>
              </InfoCard>

              {/* Stack fit */}
              {pass.stackFitForMarket && (
                <InfoCard accent="rgba(245,158,11,0.3)">
                  <SectionLabel>🛠️ Stack phù hợp với thị trường này?</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.stackFitForMarket}
                  </p>
                </InfoCard>
              )}

              {/* Company type */}
              {pass.companyTypeAnalysis && (
                <InfoCard>
                  <SectionLabel>🏢 Loại công ty & tiêu chí lọc</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.companyTypeAnalysis}
                  </p>
                </InfoCard>
              )}

              {/* Market context */}
              <InfoCard accent="rgba(245,158,11,0.2)">
                <SectionLabel>🏙️ Bối cảnh thị trường</SectionLabel>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                  {pass.marketContext}
                </p>
              </InfoCard>

              {/* Role context */}
              {pass.roleContext && (
                <InfoCard>
                  <SectionLabel>🎯 Tại sao passChance ở mức này?</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.roleContext}
                  </p>
                </InfoCard>
              )}

              {/* Improvement — CTA highlighted */}
              {pass.improvementToPassSooner && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.06))",
                    border: "1px solid rgba(139,92,246,0.35)",
                  }}
                >
                  <SectionLabel>🚀 Làm gì trong 30–60 ngày để tăng cơ hội?</SectionLabel>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {pass.improvementToPassSooner}
                  </p>
                </div>
              )}

              {/* ATS */}
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <span className="text-base flex-shrink-0">🤖</span>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "var(--muted)" }}>Nguy cơ bị lọc ATS</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>{pass.atsRisk}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── LEARNING PATH ── */}
          {tab === "path" && (
            <div className="space-y-0 animate-fadeIn">
              <SectionLabel>Lộ trình học đề xuất ({result.learningPath.length} bước)</SectionLabel>
              {result.learningPath.map((item, i) => (
                <div key={i} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "rgba(139,92,246,0.15)",
                        color: "var(--primary-light)",
                        border: "1px solid rgba(139,92,246,0.3)",
                      }}
                    >{i + 1}</div>
                    {i < result.learningPath.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: "var(--border)", minHeight: 20 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.skill}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{item.why}</p>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                      📖 {item.howToLearn}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--primary-light)" }}>⏱ {item.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── INTERVIEW READINESS ── */}
          {tab === "ready" && result.interviewReadiness && (
            <div className="space-y-4 animate-fadeIn">

              {/* Score bar */}
              <div
                className="rounded-xl px-5 py-4 flex items-center gap-4"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <span
                  className="text-4xl font-extrabold flex-shrink-0"
                  style={{
                    color: result.interviewReadiness.score >= 70 ? "var(--success)" : "var(--warning)",
                  }}
                >{result.interviewReadiness.score}%</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Mức độ sẵn sàng phỏng vấn
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    Dựa trên skill gap và độ phù hợp với role {result.detectedRole ?? ""}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <InfoCard accent="rgba(52,211,153,0.2)">
                  <SectionLabel>💪 Điểm tự tin</SectionLabel>
                  <ul className="space-y-1.5">
                    {result.interviewReadiness.strongPoints.map((p, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                        ✓ {p}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
                <InfoCard accent="rgba(251,191,36,0.2)">
                  <SectionLabel>⚠️ Câu hỏi khó có thể bị hỏi</SectionLabel>
                  <ul className="space-y-1.5">
                    {result.interviewReadiness.weakPoints.map((p, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                        • {p}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              </div>

              {result.interviewReadiness.tips?.length > 0 && (
                <InfoCard accent="rgba(139,92,246,0.2)">
                  <SectionLabel>🎯 Lời khuyên thực tế</SectionLabel>
                  <ul className="space-y-1.5">
                    {result.interviewReadiness.tips.map((tip, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                        → {tip}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}

              {result.coverLetterHints?.length > 0 && (
                <InfoCard>
                  <SectionLabel>✉️ Gợi ý Cover Letter</SectionLabel>
                  <ul className="space-y-1.5">
                    {result.coverLetterHints.map((hint, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}