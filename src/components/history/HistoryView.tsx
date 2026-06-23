"use client";

import { useState } from "react";
import { useHistoryData, type HistorySession } from "@/hooks/useHistoryData";
import { useSessionDetail } from "@/hooks/useSessionDetail";

const TYPE_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  interview:   { label: "Phỏng vấn",   icon: "🎯", color: "var(--info)",    bg: "var(--info-bg)"    },
  code_review: { label: "Code Review", icon: "🔍", color: "var(--warning)", bg: "var(--warning-bg)" },
  jd_analysis: { label: "Phân tích JD",icon: "📋", color: "var(--success)", bg: "var(--success-bg)" },
};

export default function HistoryView() {
  const { sessions, isLoading, error } = useHistoryData();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<HistorySession | null>(null);

  const filtered = sessions.filter((s) => !typeFilter || s.type === typeFilter);

  // Group sessions by date
  const grouped = filtered.reduce<Record<string, HistorySession[]>>((acc, s) => {
    const date = new Date(s.created_at).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="text-sm px-4 py-3 rounded-xl"
        style={{ color: "var(--danger)", background: "var(--danger-bg)" }}
      >
        Lỗi: {error}
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          📊 Lịch sử
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Xem lại các buổi luyện tập của bạn
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterTab label="Tất cả" icon="📋" active={typeFilter === null} onClick={() => setTypeFilter(null)} />
        {Object.entries(TYPE_INFO).map(([value, info]) => (
          <FilterTab
            key={value}
            label={info.label}
            icon={info.icon}
            active={typeFilter === value}
            onClick={() => setTypeFilter(value)}
            color={info.color}
            bg={info.bg}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="py-16 text-center rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--border-bright)",
          }}
        >
          <div className="text-5xl mb-3 animate-float">📭</div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground-2)" }}>
            Chưa có buổi luyện tập nào
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {typeFilter ? "Không có buổi nào với filter này" : "Hãy bắt đầu buổi phỏng vấn đầu tiên!"}
          </p>
        </div>
      )}

      {/* Grid: Timeline + Detail */}
      {filtered.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Timeline */}
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, daySessions]) => (
              <div key={date}>
                {/* Date heading */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-px flex-1"
                    style={{ background: "var(--border)" }}
                  />
                  <span
                    className="text-xs font-medium px-2"
                    style={{ color: "var(--muted)", whiteSpace: "nowrap" }}
                  >
                    {date}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ background: "var(--border)" }}
                  />
                </div>

                <div className="space-y-2">
                  {daySessions.map((s, i) => {
                    const info = TYPE_INFO[s.type];
                    const isSelected = selected?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className="w-full text-left rounded-xl px-4 py-3 transition-all duration-200 animate-fadeIn"
                        style={{
                          animationDelay: `${i * 0.05}s`,
                          background: isSelected ? "rgba(139,92,246,0.08)" : "var(--surface)",
                          border: `1px solid ${isSelected ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                          boxShadow: isSelected ? "0 0 16px rgba(139,92,246,0.1)" : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                            style={{
                              background: info?.bg ?? "var(--surface-hover)",
                              border: `1px solid ${info?.color ?? "var(--border)"}25`,
                            }}
                          >
                            {info?.icon ?? "📝"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{
                                color: isSelected ? "var(--primary-light)" : "var(--foreground)",
                              }}
                            >
                              {s.topic ?? "—"}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                              {info?.label ?? s.type}
                            </p>
                          </div>
                          {isSelected && (
                            <span style={{ color: "var(--primary-light)", fontSize: 12 }}>▶</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="sticky top-20">
            {selected ? (
              <SessionDetailPanel session={selected} />
            ) : (
              <div
                className="py-16 text-center rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px dashed var(--border-bright)",
                }}
              >
                <div className="text-4xl mb-3 animate-float">👆</div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground-2)" }}>
                  Chọn 1 buổi bên trái
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  để xem chi tiết
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Session Detail ── */
function SessionDetailPanel({ session }: { session: HistorySession }) {
  const { detail, isLoading, error } = useSessionDetail(session.id, session.type);
  const info = TYPE_INFO[session.type];

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fadeIn">
        <div className="skeleton h-6 w-32 rounded-full" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm px-4 py-3 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
        {error}
      </p>
    );
  }

  if (!detail) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Không có dữ liệu.
      </p>
    );
  }

  const headerStyle = {
    background: `linear-gradient(135deg, ${info?.color ?? "var(--primary)"}15, transparent)`,
    borderBottom: "1px solid var(--border)",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden animate-scaleIn"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Panel header */}
      <div className="px-5 py-4 flex items-center gap-3" style={headerStyle}>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: info?.bg ?? "var(--surface-hover)" }}
        >
          {info?.icon ?? "📝"}
        </span>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            {session.topic ?? "—"}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {info?.label ?? session.type} · {new Date(session.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto" style={{ background: "var(--surface)" }}>
        {/* Interview detail */}
        {detail.type === "interview" &&
          detail.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-2"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                {item.question}
              </p>
              {item.userAnswer && (
                <p
                  className="text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--foreground-2)" }}
                >
                  {item.userAnswer}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {item.score !== null && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        (item.score ?? 0) >= 7
                          ? "var(--success-bg)"
                          : (item.score ?? 0) >= 5
                          ? "var(--warning-bg)"
                          : "var(--danger-bg)",
                      color:
                        (item.score ?? 0) >= 7
                          ? "var(--success)"
                          : (item.score ?? 0) >= 5
                          ? "var(--warning)"
                          : "var(--danger)",
                    }}
                  >
                    ⭐ {item.score}/10
                  </span>
                )}
              </div>
              {item.aiFeedback && (
                <p
                  className="text-xs leading-relaxed whitespace-pre-wrap pt-2"
                  style={{
                    color: "var(--muted)",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 8,
                  }}
                >
                  {item.aiFeedback}
                </p>
              )}
            </div>
          ))}

        {/* Code review detail */}
        {detail.type === "code_review" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
              >
                {detail.language}
              </span>
            </div>
            <pre
              className="text-xs p-3 rounded-xl overflow-x-auto"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-bright)",
                color: "var(--foreground-2)",
                fontFamily: "'Geist Mono', monospace",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {detail.codeInput}
            </pre>
            <div
              className="p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground-2)",
              }}
            >
              {(() => {
                try {
                  const parsed = JSON.parse(detail.aiReview);
                  return Object.entries(parsed)
                    .map(([key, value]) => `${key}:\n${value}`)
                    .join("\n\n");
                } catch {
                  return detail.aiReview;
                }
              })()}
            </div>
          </div>
        )}

        {/* JD analysis detail */}
        {detail.type === "jd_analysis" && (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
                Level ước tính
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--primary-light)" }}>
                {detail.level}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                Tech stack
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.techStack.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "var(--primary-light)",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <details
              className="text-sm"
              style={{ color: "var(--foreground-2)" }}
            >
              <summary
                className="cursor-pointer text-xs font-medium"
                style={{ color: "var(--primary-light)" }}
              >
                📄 Xem JD gốc
              </summary>
              <p
                className="mt-2 text-xs leading-relaxed whitespace-pre-wrap p-3 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                {detail.jdText}
              </p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Filter Tab ── */
function FilterTab({
  label,
  icon,
  active,
  onClick,
  color,
  bg,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        background: active ? (bg ?? "rgba(139,92,246,0.12)") : "var(--surface)",
        border: `1px solid ${active ? (color ?? "var(--primary)") + "40" : "var(--border)"}`,
        color: active ? (color ?? "var(--primary-light)") : "var(--muted)",
        boxShadow: active ? `0 2px 8px ${color ?? "var(--primary)"}20` : "none",
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}