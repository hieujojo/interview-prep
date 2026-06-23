"use client";

import { useMistakeHistory } from "@/hooks/useMistakeHistory";

export default function HistoryView() {
  const { mistakes, isLoading, error } = useMistakeHistory();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fadeInUp">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 rounded-xl" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)25" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>{error}</p>
      </div>
    );
  }

  // Phân tích tần suất sai theo topic
  const freqMap: Record<string, number> = {};
  mistakes.forEach(m => {
    freqMap[m.category] = (freqMap[m.category] || 0) + 1;
  });

  const sortedFreq = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp pb-12">
      <div>
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          📖 Sổ Tay Lỗi Sai
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Nơi lưu giữ những sai lầm. Hãy nhìn lại để tránh lặp lại trong tương lai.
        </p>
      </div>

      {mistakes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">✨</div>
          <p className="font-bold text-lg" style={{ color: "var(--success)" }}>Thật xuất sắc! Bạn chưa mắc lỗi nghiêm trọng nào.</p>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>Lịch sử phỏng vấn của bạn hoàn hảo (không có câu nào dưới 5 điểm).</p>
        </div>
      ) : (
        <>
          {/* Tần suất sai */}
          <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
              📊 Tần suất điểm yếu theo Chủ đề
            </p>
            <div className="flex flex-wrap gap-3">
              {sortedFreq.map(([topic, count]) => (
                <div key={topic} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{topic}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                    Sai {count} lần
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sổ tay chi tiết */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>📝 Danh sách chi tiết cần ôn lại</h2>
            {mistakes.map((m) => (
              <div key={m.id} className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <div className="flex justify-between items-start gap-4 border-b pb-4" style={{ borderColor: "var(--border-bright)" }}>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{m.category}</p>
                    <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--foreground)" }}>
                      Q: {m.question}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                    ⭐ Score: {m.score}/10
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl" style={{ background: "var(--surface-hover)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--danger)" }}>⚠️ Câu trả lời của bạn</p>
                    <p className="text-sm" style={{ color: "var(--foreground-2)" }}>{m.userAnswer}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "var(--info-bg)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--info)" }}>💡 Hướng khắc phục (AI)</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground-2)" }}>{m.aiFeedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
