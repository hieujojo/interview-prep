"use client";

import { useState } from "react";
import type { EmailDraftResult } from "@/hooks/useEmailDraft";

type Props = {
  jdText: string;
  companyName?: string | null;
  onClose: () => void;
  onGenerate: (opts: {
    candidateName?: string;
    recipientName?: string;
    companyName?: string;
    cvText?: string;
  }) => void;
  isGenerating: boolean;
  draft: EmailDraftResult | null;
  error: string | null;
};

export default function EmailDraftModal({
  jdText,
  companyName,
  onClose,
  onGenerate,
  isGenerating,
  draft,
  error,
}: Props) {
  const [candidateName, setCandidateName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [useCV, setUseCV] = useState(false);
  const [copied, setCopied] = useState<"subject" | "body" | "full" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const hasSavedCV =
    typeof window !== "undefined" && !!localStorage.getItem("cv_profile_text");

  const handleGenerate = () => {
    const cvText =
      useCV && typeof window !== "undefined"
        ? localStorage.getItem("cv_profile_text") ?? undefined
        : undefined;

    onGenerate({
      candidateName: candidateName.trim() || undefined,
      recipientName: recipientName.trim() || undefined,
      companyName: companyName ?? undefined,
      cvText,
    });
  };

  const copyText = (text: string, type: "subject" | "body" | "full") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeSubject = selectedSubject ?? draft?.subject ?? "";
  const fullEmail = draft
    ? `Tiêu đề: ${activeSubject}\n\n${draft.body}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn"
        style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-5 border-b"
          style={{ borderColor: "var(--border)", background: "var(--surface)", zIndex: 10 }}
        >
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>
              ✉️ Viết Email Ứng Tuyển
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              AI sinh email chuyên nghiệp phù hợp với JD{companyName ? ` tại ${companyName}` : ""}
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

        <div className="p-5 space-y-4">
          {/* Options */}
          {!draft && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                    Tên của bạn (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full text-sm rounded-xl px-3 py-2 focus:outline-none transition-all"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-bright)",
                      color: "var(--foreground)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                    Tên người nhận (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Hiring Manager / Tên HR"
                    className="w-full text-sm rounded-xl px-3 py-2 focus:outline-none transition-all"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-bright)",
                      color: "var(--foreground)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
                  />
                </div>
              </div>

              {hasSavedCV && (
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <input
                    type="checkbox"
                    checked={useCV}
                    onChange={(e) => setUseCV(e.target.checked)}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      Sử dụng CV đã phân tích
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      AI sẽ nhấn mạnh điểm phù hợp từ CV của bạn với JD này
                    </p>
                  </div>
                </label>
              )}

              {error && (
                <p className="text-sm px-4 py-3 rounded-xl"
                  style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.8s linear infinite" }} />
                    Đang viết email...
                  </>
                ) : (
                  "✨ Sinh Email"
                )}
              </button>
            </div>
          )}

          {/* Result */}
          {draft && (
            <div className="space-y-4 animate-fadeInUp">
              {/* Subject */}
              <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold" style={{ color: "var(--muted)" }}>📧 TIÊU ĐỀ EMAIL</p>
                  <button
                    onClick={() => copyText(activeSubject, "subject")}
                    className="text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{
                      color: copied === "subject" ? "var(--success)" : "var(--primary-light)",
                      background: copied === "subject" ? "var(--success-bg)" : "rgba(139,92,246,0.1)",
                    }}
                  >
                    {copied === "subject" ? "✓ Đã chép" : "📋 Copy"}
                  </button>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {activeSubject}
                </p>

                {draft.alternativeSubjects?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>🔄 Tiêu đề thay thế:</p>
                    <div className="space-y-1.5">
                      {draft.alternativeSubjects.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSubject(s)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                          style={{
                            background: selectedSubject === s ? "rgba(139,92,246,0.12)" : "var(--surface)",
                            border: `1px solid ${selectedSubject === s ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                            color: selectedSubject === s ? "var(--primary-light)" : "var(--foreground-2)",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: "var(--muted)" }}>📝 NỘI DUNG EMAIL</p>
                  <button
                    onClick={() => copyText(draft.body, "body")}
                    className="text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{
                      color: copied === "body" ? "var(--success)" : "var(--primary-light)",
                      background: copied === "body" ? "var(--success-bg)" : "rgba(139,92,246,0.1)",
                    }}
                  >
                    {copied === "body" ? "✓ Đã chép" : "📋 Copy"}
                  </button>
                </div>
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--foreground)" }}
                >
                  {draft.body}
                </p>
              </div>

              {/* Tips */}
              {draft.tips?.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "var(--warning)" }}>💡 Lời khuyên</p>
                  {draft.tips.map((tip, i) => (
                    <p key={i} className="text-xs mb-1.5" style={{ color: "var(--foreground-2)" }}>→ {tip}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyText(fullEmail, "full")}
                  className="flex-1 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                >
                  {copied === "full" ? "✓ Đã chép toàn bộ!" : "📋 Copy toàn bộ email"}
                </button>
                <button
                  onClick={() => {
                    // Reset để sinh lại
                    onGenerate({
                      candidateName: candidateName.trim() || undefined,
                      recipientName: recipientName.trim() || undefined,
                      companyName: companyName ?? undefined,
                      cvText:
                        useCV && typeof window !== "undefined"
                          ? localStorage.getItem("cv_profile_text") ?? undefined
                          : undefined,
                    });
                  }}
                  disabled={isGenerating}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-bright)",
                    color: "var(--muted)",
                  }}
                >
                  🔄 Sinh lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
