"use client";

import { useEffect } from "react";
import { useDocumentRecommendation, RecommendedDocument } from "@/hooks/useDocumentRecommendation";

type Props = {
  open: boolean;
  onClose: () => void;
  onDownload: (docId: string) => void;
  isDownloading: boolean;
};

const FILE_TYPE_ICON: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
};

export function AIRecommendationModal({ open, onClose, onDownload, isDownloading }: Props) {
  const { getRecommendations, result, isLoading, error, reset } = useDocumentRecommendation();

  useEffect(() => {
    if (open) {
      reset();
      getRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-scaleIn"
        style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              🤖
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--foreground)" }}>
                Gợi ý AI
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Dựa trên lịch sử phỏng vấn của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--primary)" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                AI đang phân tích lịch sử phỏng vấn...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">⚠️</p>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Không thể tải gợi ý</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{error}</p>
              <button
                onClick={() => getRecommendations()}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold btn-gradient"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Result */}
          {!isLoading && result && (
            <>
              {/* Weaknesses */}
              {result.weaknesses.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--danger)" }}>
                    🔍 Điểm yếu phát hiện
                  </p>
                  <ul className="space-y-1">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: "var(--foreground-2)" }}>
                        <span className="mt-1 shrink-0" style={{ color: "var(--danger)" }}>•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Không tìm thấy tài liệu phù hợp
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Hiệu suất phỏng vấn của bạn rất tốt hoặc chưa có tài liệu tương ứng.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    📚 Tài liệu được gợi ý ({result.recommendations.length})
                  </p>
                  {result.recommendations.map((doc: RecommendedDocument) => (
                    <div
                      key={doc.id}
                      className="rounded-xl p-4 flex gap-3 transition-colors"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: doc.file_type === "pdf" ? "rgba(248,113,113,0.1)" : "rgba(96,165,250,0.1)" }}
                      >
                        {FILE_TYPE_ICON[doc.file_type] ?? "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                          {doc.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {doc.topics?.name && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}>
                              {doc.topics.name}
                            </span>
                          )}
                          {doc.difficulty && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.1)", color: "var(--warning)" }}>
                              {doc.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-2 italic" style={{ color: "var(--muted)" }}>
                          💡 {doc.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => onDownload(doc.id)}
                        disabled={isDownloading}
                        className="shrink-0 self-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: "rgba(139,92,246,0.15)",
                          color: "var(--primary-light)",
                          border: "1px solid rgba(139,92,246,0.2)",
                        }}
                      >
                        ⬇
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
