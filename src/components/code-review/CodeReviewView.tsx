"use client";

import Editor from "@monaco-editor/react";
import type { CodeReviewResult } from "@/hooks/useCodeReview";
import { useState } from "react";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", icon: "🟨" },
  { label: "TypeScript", value: "typescript", icon: "🔷" },
  { label: "Python",     value: "python",     icon: "🐍" },
  { label: "Go",         value: "go",         icon: "🔵" },
  { label: "Java",       value: "java",       icon: "☕" },
  { label: "SQL",        value: "sql",        icon: "🗄️" },
  { label: "Other",      value: "plaintext",  icon: "📄" },
];

const REVIEW_SECTIONS = [
  { key: "syntaxErrors",   icon: "🔴", label: "Lỗi cú pháp",   severity: "danger" },
  { key: "logicErrors",    icon: "🟠", label: "Lỗi logic",     severity: "warning" },
  { key: "edgeCases",      icon: "🟡", label: "Edge cases",    severity: "warning" },
  { key: "performance",    icon: "🔵", label: "Performance",   severity: "info" },
  { key: "bestPractices",  icon: "🟢", label: "Best practices",severity: "success" },
  { key: "security",       icon: "🛡️", label: "Security",      severity: "info" },
] as const;

const SEVERITY_STYLE = {
  danger:  { color: "var(--danger)",  bg: "var(--danger-bg)"  },
  warning: { color: "var(--warning)", bg: "var(--warning-bg)" },
  info:    { color: "var(--info)",    bg: "var(--info-bg)"    },
  success: { color: "var(--success)", bg: "var(--success-bg)" },
};

type Props = {
  language: string;
  onChangeLanguage: (lang: string) => void;
  context: string;
  onChangeContext: (text: string) => void;
  code: string;
  onChangeCode: (code: string) => void;
  onReview: () => void;
  isReviewing: boolean;
  error: string | null;
  result: CodeReviewResult | null;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | null;
};

export default function CodeReviewView({
  language,
  onChangeLanguage,
  context,
  onChangeContext,
  code,
  onChangeCode,
  onReview,
  isReviewing,
  error,
  result,
  isSaving,
  isSaved,
  saveError,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["syntaxErrors", "logicErrors"])
  );
  const [copied, setCopied] = useState(false);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          🔍 Code Review AI
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Submit code của bạn để AI review chi tiết về bugs, performance và best practices
        </p>
      </div>

      {/* Language selector */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          Ngôn ngữ
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const active = language === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => onChangeLanguage(lang.value)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? "var(--gradient-primary)" : "var(--surface-2)",
                  border: `1px solid ${active ? "transparent" : "var(--border-bright)"}`,
                  color: active ? "white" : "var(--foreground-2)",
                  boxShadow: active ? "0 4px 12px var(--primary-glow)" : "none",
                }}
              >
                <span>{lang.icon}</span>
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <label className="text-sm font-semibold block mb-2" style={{ color: "var(--foreground)" }}>
          Mô tả context
          <span className="ml-1.5 font-normal text-xs" style={{ color: "var(--muted)" }}>
            (tuỳ chọn)
          </span>
        </label>
        <textarea
          value={context}
          onChange={(e) => onChangeContext(e.target.value)}
          rows={2}
          placeholder="Đề bài là gì, mục đích của đoạn code này..."
          className="w-full text-sm rounded-xl p-3 resize-none focus:outline-none transition-all duration-200"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            color: "var(--foreground)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
        />
      </div>

      {/* Code editor */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        {/* Editor header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28ca41" }} />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              {language === "plaintext" ? "code" : `main.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language}`}
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {code.split("\n").length} dòng
          </span>
        </div>
        <Editor
          height="380px"
          language={language}
          value={code}
          onChange={(value) => onChangeCode(value ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: "'Geist Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {error && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{ color: "var(--danger)", background: "var(--danger-bg)" }}
        >
          {error}
        </p>
      )}

      <button
        onClick={onReview}
        disabled={!code.trim() || isReviewing}
        className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
      >
        {isReviewing ? (
          <>
            <span
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            Đang phân tích...
          </>
        ) : (
          "✨ AI Review"
        )}
      </button>

      {result && (
        <div className="space-y-3 animate-fadeInUp">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            📝 Kết quả Review
          </h2>

          {/* Review sections (accordion) */}
          {REVIEW_SECTIONS.map(({ key, icon, label, severity }) => {
            const content = result[key as keyof CodeReviewResult] as string;
            const style = SEVERITY_STYLE[severity];
            const expanded = expandedSections.has(key);

            return (
              <div
                key={key}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{ border: `1px solid ${style.color}25` }}
              >
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{ background: style.bg }}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: style.color }}>
                    <span>{icon}</span>
                    {label}
                  </span>
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{
                      color: style.color,
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {expanded && (
                  <div
                    className="px-4 py-3 animate-fadeIn"
                    style={{ background: "var(--surface)" }}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                      {content || "Không có vấn đề."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Improved code */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(139,92,246,0.25)" }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(139,92,246,0.08)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--primary-light)" }}>
                ✨ Code cải thiện
              </span>
              <button
                onClick={() => handleCopy(result.improvedCode)}
                className="text-xs px-3 py-1 rounded-lg transition-all duration-200"
                style={{
                  background: copied ? "var(--success-bg)" : "rgba(139,92,246,0.15)",
                  color: copied ? "var(--success)" : "var(--primary-light)",
                  border: `1px solid ${copied ? "var(--success)" : "rgba(139,92,246,0.3)"}20`,
                }}
              >
                {copied ? "✅ Đã copy" : "📋 Copy"}
              </button>
            </div>
            <pre
              className="p-4 text-xs overflow-x-auto"
              style={{
                background: "var(--surface)",
                color: "var(--foreground-2)",
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {result.improvedCode}
            </pre>
          </div>

          {/* Save status */}
          {(isSaving || isSaved || saveError) && (
            <div
              className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: isSaved ? "var(--success-bg)" : "var(--surface)",
                border: `1px solid ${isSaved ? "rgba(52,211,153,0.2)" : "var(--border)"}`,
                color: isSaved ? "var(--success)" : saveError ? "var(--danger)" : "var(--muted)",
              }}
            >
              {isSaving && (
                <>
                  <span
                    className="w-4 h-4 border-2 border-t-transparent rounded-full"
                    style={{ animation: "spin 0.8s linear infinite", borderColor: "var(--muted) transparent transparent" }}
                  />
                  Đang lưu vào lịch sử...
                </>
              )}
              {isSaved && "✅ Đã lưu vào lịch sử."}
              {saveError && `Lỗi lưu: ${saveError}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}