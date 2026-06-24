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
  hasSavedCV?: boolean;
  savedCvText?: string;
};

export default function EmailDraftModal({
  jdText,
  companyName,
  onClose,
  onGenerate,
  isGenerating,
  draft,
  error,
  hasSavedCV,
  savedCvText,
}: Props) {
  const [candidateName, setCandidateName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [useCV, setUseCV] = useState(false);
  const [copied, setCopied] = useState<"subject" | "body" | "full" | null>(null);
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [selectedSubjectVi, setSelectedSubjectVi] = useState<string | null>(null);
  const [selectedSubjectEn, setSelectedSubjectEn] = useState<string | null>(null);

  const handleGenerate = () => {
    const cvText = useCV ? savedCvText : undefined;

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

  const activeSubject = language === "vi"
    ? (selectedSubjectVi ?? draft?.subject ?? "")
    : (selectedSubjectEn ?? draft?.subjectEn ?? "");
    
  const currentBody = language === "vi" ? draft?.body : draft?.bodyEn;
  const currentAlternatives = language === "vi" ? draft?.alternativeSubjects : draft?.alternativeSubjectsEn;

  const fullEmail = draft
    ? `Tiêu đề: ${activeSubject}\n\n${currentBody}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn flex flex-col"
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

        <div className="p-5 flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-6 h-full">
            {/* Left: Options */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-3 p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Thông tin thêm</h3>
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

              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.8s linear infinite" }} />
                    Đang viết email...
                  </>
                ) : draft ? (
                  "🔄 Sinh lại Email"
                ) : (
                  "✨ Sinh Email"
                )}
              </button>
            </div>

            {/* Right: Result */}
            <div className="lg:col-span-8 flex flex-col h-full">
              {!draft && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-xl" style={{ background: "var(--surface-2)", border: "1px dashed var(--border)" }}>
                  <span className="text-4xl mb-3">✉️</span>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Chưa có email nào</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Điền thông tin bên trái và nhấn "Sinh Email" để AI tự động soạn thảo cho bạn.</p>
                </div>
              )}
              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-xl" style={{ background: "var(--surface-2)", border: "1px dashed var(--border)" }}>
                  <span className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-3" style={{ animation: "spin 1s linear infinite" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>AI đang soạn email...</p>
                </div>
              )}
          {draft && (
            <div className="space-y-4 animate-fadeInUp">
              {/* Language Toggle */}
              <div className="flex bg-surface-2 p-1 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setLanguage("vi")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    language === "vi" ? "bg-white shadow-sm text-purple-600" : "text-muted hover:text-foreground"
                  }`}
                  style={{
                    background: language === "vi" ? "var(--surface)" : "transparent",
                    color: language === "vi" ? "var(--primary)" : "var(--muted)",
                  }}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    language === "en" ? "bg-white shadow-sm text-purple-600" : "text-muted hover:text-foreground"
                  }`}
                  style={{
                    background: language === "en" ? "var(--surface)" : "transparent",
                    color: language === "en" ? "var(--primary)" : "var(--muted)",
                  }}
                >
                  🇬🇧 Tiếng Anh
                </button>
              </div>

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

                {currentAlternatives && currentAlternatives.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>🔄 Tiêu đề thay thế:</p>
                    <div className="space-y-1.5">
                      {currentAlternatives.map((s, i) => {
                        const isSelected = language === "vi" ? selectedSubjectVi === s : selectedSubjectEn === s;
                        return (
                          <button
                            key={i}
                            onClick={() => language === "vi" ? setSelectedSubjectVi(s) : setSelectedSubjectEn(s)}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                            style={{
                              background: isSelected ? "rgba(139,92,246,0.12)" : "var(--surface)",
                              border: `1px solid ${isSelected ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                              color: isSelected ? "var(--primary-light)" : "var(--foreground-2)",
                            }}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: "var(--muted)" }}>📝 NỘI DUNG EMAIL</p>
                  <button
                    onClick={() => copyText(currentBody ?? "", "body")}
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
                  {currentBody}
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
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => copyText(fullEmail, "full")}
                  className="flex-1 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                >
                  {copied === "full" ? "✓ Đã chép toàn bộ!" : "📋 Copy toàn bộ email"}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
