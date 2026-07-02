"use client";

import { useState } from "react";
import { Document } from "@/hooks/useDocuments";

type Props = {
  doc: Document;
  onDownload: (docId: string) => void;
  isDownloading: boolean;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Cơ bản": "rgba(52, 211, 153, 0.15)",
  "Trung bình": "rgba(251, 191, 36, 0.15)",
  "Nâng cao": "rgba(248, 113, 113, 0.15)",
};
const DIFFICULTY_TEXT_COLORS: Record<string, string> = {
  "Cơ bản": "#34d399",
  "Trung bình": "#fbbf24",
  "Nâng cao": "#f87171",
};

export function DocumentCard({ doc, onDownload, isDownloading }: Props) {
  const isPdf = doc.file_type === "pdf";

  return (
    <div
      className="glass-card p-5 flex flex-col gap-3 animate-fadeInUp"
      style={{ minHeight: 180 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* File type icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{
            background: isPdf
              ? "rgba(248, 113, 113, 0.12)"
              : "rgba(96, 165, 250, 0.12)",
          }}
        >
          {isPdf ? "📄" : "📝"}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm leading-snug truncate"
            style={{ color: "var(--foreground)" }}
            title={doc.title}
          >
            {doc.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {doc.file_name}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {doc.topics?.name && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              color: "var(--primary-light)",
            }}
          >
            {doc.topics.name}
          </span>
        )}
        {doc.categories?.name && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(96, 165, 250, 0.1)",
              color: "var(--info)",
            }}
          >
            {doc.categories.name}
          </span>
        )}
        {doc.difficulty && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: DIFFICULTY_COLORS[doc.difficulty] ?? "rgba(139,92,246,0.1)",
              color: DIFFICULTY_TEXT_COLORS[doc.difficulty] ?? "var(--primary-light)",
            }}
          >
            {doc.difficulty}
          </span>
        )}
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "var(--muted)",
          }}
        >
          {doc.file_type}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => onDownload(doc.id)}
          disabled={isDownloading}
          className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
          style={{
            background: isDownloading
              ? "rgba(139,92,246,0.1)"
              : "rgba(139,92,246,0.15)",
            color: "var(--primary-light)",
            border: "1px solid rgba(139,92,246,0.2)",
            cursor: isDownloading ? "not-allowed" : "pointer",
          }}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Đang tạo link...
            </>
          ) : (
            <>
              ⬇ Tải xuống
            </>
          )}
        </button>
      </div>
    </div>
  );
}
