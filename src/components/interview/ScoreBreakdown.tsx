import type { AIReviewResult } from "@/hooks/useAIReview";

const RUBRIC = [
  { key: "technical",      label: "Technical Accuracy",  weight: 40, icon: "🎯" },
  { key: "problemSolving", label: "Problem Solving",      weight: 25, icon: "🧩" },
  { key: "communication",  label: "Communication",        weight: 20, icon: "💬" },
  { key: "bestPractices",  label: "Best Practices",       weight: 15, icon: "⭐" },
] as const;

export function ScoreBreakdown({ feedback }: { feedback: AIReviewResult }) {
  const scores = feedback.categoryScores;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted mb-4">
        📊 Breakdown điểm theo tiêu chí
      </p>

      {RUBRIC.map(({ key, label, weight, icon }) => {
        const rawScore = scores?.[key] ?? null;
        const weighted = rawScore !== null ? rawScore * (weight / 100) : null;
        const barPercent = rawScore !== null ? (rawScore / 10) * 100 : 0;
        const barColor =
          rawScore === null ? "var(--border)"
          : rawScore >= 7 ? "var(--success)"
          : rawScore >= 5 ? "var(--warning)"
          : "var(--danger)";

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                {icon} {label}
                <span className="text-xs text-muted font-normal">(×{weight}%)</span>
              </span>
              <span className="font-extrabold" style={{ color: barColor }}>
                {rawScore !== null ? (
                  <>{rawScore}<span className="text-muted font-normal text-xs">/10</span></>
                ) : (
                  <span className="text-muted text-xs">—</span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barPercent}%`, background: barColor }}
              />
            </div>
            {weighted !== null && (
              <p className="text-xs text-muted text-right">
                Đóng góp: {weighted.toFixed(2)} điểm
              </p>
            )}
          </div>
        );
      })}

      <div
        className="flex items-center justify-between pt-3 mt-2 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-sm font-bold text-foreground">Điểm tổng kết</span>
        <span
          className="text-2xl font-extrabold"
          style={{
            color: feedback.score >= 7 ? "var(--success)"
                 : feedback.score >= 5 ? "var(--warning)"
                 : "var(--danger)"
          }}
        >
          {feedback.score}<span className="text-sm font-normal text-muted">/10</span>
        </span>
      </div>
    </div>
  );
}