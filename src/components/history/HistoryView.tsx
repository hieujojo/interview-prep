"use client";

import { useMistakeHistory , type Mistake } from "@/hooks/useMistakeHistory";

export default function MistakeHistoryView() {
  const { mistakes, isLoading, isEmpty, error } = useMistakeHistory();

  // 1. Loading
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="skeleton h-10 w-48 rounded-xl" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  // 2. Error
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

  // 3. Empty — tách riêng, không lẫn với error hay loading
  if (isEmpty) {
    return (
      <div
        className="py-16 text-center rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px dashed var(--border-bright)",
        }}
      >
        <div className="text-5xl mb-3 animate-float">🎉</div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground-2)" }}>
          Không có câu nào sai
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Hãy tiếp tục luyện tập!
        </p>
      </div>
    );
  }

  // 4. Data
  return (
    <div className="space-y-6 animate-fadeInUp">
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          ❌ Lịch sử sai
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Các câu trả lời dưới 5 điểm
        </p>
      </div>

      <div className="space-y-3">
        {mistakes.map((mistake, i) => (
          <MistakeCard key={mistake.id} mistake={mistake} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Mistake Card ── */
function MistakeCard({ mistake, index }: { mistake: Mistake; index: number }) {
  return (
    <div
      className="rounded-xl p-4 space-y-2 animate-fadeIn"
      style={{
        animationDelay: `${index * 0.05}s`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {mistake.question}
        </p>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: "var(--danger-bg)",
            color: "var(--danger)",
          }}
        >
          ⭐ {mistake.score}/10
        </span>
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {mistake.category}
      </p>

      {mistake.userAnswer && (
        <p
          className="text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--foreground-2)" }}
        >
          {mistake.userAnswer}
        </p>
      )}

      {mistake.aiFeedback && (
        <p
          className="text-xs leading-relaxed whitespace-pre-wrap pt-2"
          style={{
            color: "var(--muted)",
            borderTop: "1px solid var(--border)",
            paddingTop: 8,
          }}
        >
          {mistake.aiFeedback}
        </p>
      )}
    </div>
  );
}