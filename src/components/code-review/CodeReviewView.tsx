"use client";

import Editor from "@monaco-editor/react";
import type { CodeReviewResult } from "@/hooks/useCodeReview";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "SQL", value: "sql" },
  { label: "Other", value: "plaintext" },
];

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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Code Review bằng AI</h1>

      <div>
        <p className="text-sm text-muted mb-2">Ngôn ngữ</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onChangeLanguage(lang.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                language === lang.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary hover:bg-surface-hover"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted mb-2">Mô tả context (tuỳ chọn)</p>
        <textarea
          value={context}
          onChange={(e) => onChangeContext(e.target.value)}
          rows={2}
          placeholder="Đề bài là gì, mục đích của đoạn code này..."
          className="w-full bg-surface border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <p className="text-sm text-muted mb-2">Code</p>
        <div className="border border-border rounded-md overflow-hidden">
          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={(value) => onChangeCode(value ?? "")}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        onClick={onReview}
        disabled={!code.trim() || isReviewing}
        className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isReviewing ? "Đang phân tích..." : "AI Review"}
      </button>

      {result && (
        <div className="border border-border rounded-md p-4 bg-surface space-y-4">
          <ReviewSection title="🔴 Lỗi cú pháp" content={result.syntaxErrors} />
          <ReviewSection title="🟠 Lỗi logic" content={result.logicErrors} />
          <ReviewSection title="🟡 Edge cases" content={result.edgeCases} />
          <ReviewSection title="🔵 Performance" content={result.performance} />
          <ReviewSection title="🟢 Best practices" content={result.bestPractices} />
          <ReviewSection title="🛡️ Security" content={result.security} />

          <div>
            <p className="text-sm font-medium text-primary mb-2">✨ Code cải thiện</p>
            <pre className="bg-background border border-border rounded-md p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
              {result.improvedCode}
            </pre>
          </div>

          <div className="pt-2 border-t border-border">
            {isSaving && <p className="text-muted text-xs">Đang lưu vào lịch sử...</p>}
            {isSaved && <p className="text-success text-xs">✅ Đã lưu vào lịch sử.</p>}
            {saveError && <p className="text-danger text-xs">Lỗi lưu: {saveError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{content}</p>
    </div>
  );
}