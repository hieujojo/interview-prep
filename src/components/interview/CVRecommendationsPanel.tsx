"use client";

import { useState } from "react";
import type { RecommendedTopic } from "@/hooks/useCVTopicRecommendations";

// ── Level badge colors (mirrors ProfileView.tsx LEVEL_STYLE) ───────────────
const LEVEL_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  Intern:  { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)"  },
  Fresher: { color: "var(--info)",    bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)"   },
  Junior:  { color: "var(--success)", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.35)"   },
  Middle:  { color: "var(--warning)", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)"   },
  Senior:  { color: "var(--danger)",  bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)"  },
};

// ── Tooltip with reason ────────────────────────────────────────────────────
function TopicChip({
  item,
  onClick,
}: {
  item: RecommendedTopic;
  onClick: () => void;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        id={`cv-rec-topic-${item.topicName.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={onClick}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
        style={
          item.isChallenge
            ? {
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.4)",
                color: "var(--warning)",
              }
            : {
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.4)",
                color: "var(--primary)",
              }
        }
      >
        {item.isChallenge ? "🔥" : "✦"} {item.topicName}
      </button>

      {/* Reason tooltip */}
      {showTip && item.reason && (
        <div
          className="absolute bottom-full left-1/2 mb-2 z-50 animate-fadeIn pointer-events-none"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className="px-3 py-2 rounded-xl text-xs font-medium max-w-[220px] text-center leading-relaxed"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "var(--foreground)",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
            }}
          >
            {item.reason}
          </div>
          {/* Arrow */}
          <div
            className="mx-auto w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid rgba(139,92,246,0.3)",
              width: "fit-content",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Props = {
  recommended: RecommendedTopic[];
  challenge: RecommendedTopic[];
  currentLevel: string;
  /** Called when user clicks a topic chip — parent selects that topic */
  onSelectTopic: (topicName: string) => void;
};

export function CVRecommendationsPanel({
  recommended,
  challenge,
  currentLevel,
  onSelectTopic,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const levelStyle = LEVEL_STYLE[currentLevel] ?? LEVEL_STYLE["Fresher"];
  const hasAny = recommended.length > 0 || challenge.length > 0;

  if (!hasAny) return null;

  return (
    <div
      id="cv-recommendations-panel"
      className="max-w-4xl mx-auto rounded-2xl overflow-hidden transition-all duration-300 animate-fadeInUp"
      style={{
        background: "rgba(139,92,246,0.05)",
        border: "1px solid rgba(139,92,246,0.25)",
      }}
    >
      {/* ── Header ── */}
      <button
        id="cv-recommendations-toggle"
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-sm font-bold text-foreground">Gợi ý từ CV của bạn</p>
            <p className="text-xs text-muted mt-0.5">
              Nhấn vào topic để chọn ngay • Chỉ là gợi ý, bạn vẫn tự do lựa chọn
            </p>
          </div>
          {/* Level badge */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
            style={{
              color: levelStyle.color,
              background: levelStyle.bg,
              borderColor: levelStyle.border,
            }}
          >
            {currentLevel}
          </span>
        </div>

        <span
          className="text-muted text-sm transition-transform duration-200 shrink-0"
          style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }}
        >
          ▼
        </span>
      </button>

      {/* ── Body ── */}
      {!collapsed && (
        <div className="px-5 pb-5 space-y-5 animate-fadeIn">
          <div className="h-px" style={{ background: "rgba(139,92,246,0.2)" }} />

          {/* Recommended tier */}
          {recommended.length > 0 && (
            <div className="space-y-2">
              <p
                className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: "var(--primary)" }}
              >
                <span>✦</span> Phù hợp với bạn
                <span className="normal-case text-muted font-normal tracking-normal">
                  ({recommended.length} topic)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {recommended.map((item) => (
                  <TopicChip
                    key={item.topicName}
                    item={item}
                    onClick={() => onSelectTopic(item.topicName)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Challenge tier */}
          {challenge.length > 0 && (
            <div className="space-y-2">
              <p
                className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: "var(--warning)" }}
              >
                <span>🔥</span> Challenge — Vượt giới hạn
                <span
                  className="normal-case font-normal tracking-normal"
                  style={{ color: "var(--muted)" }}
                >
                  ({challenge.length} topic)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {challenge.map((item) => (
                  <TopicChip
                    key={item.topicName}
                    item={item}
                    onClick={() => onSelectTopic(item.topicName)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
