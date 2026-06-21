"use client";

import { useState } from "react";
import { useHistoryData, type HistorySession } from "@/hooks/useHistoryData";
import { useSessionDetail } from "@/hooks/useSessionDetail";

const TYPE_LABEL: Record<string, string> = {
  interview: "Phỏng vấn",
  code_review: "Code Review",
  jd_analysis: "Phân tích JD",
};

export default function HistoryView() {
  const { sessions, isLoading, error } = useHistoryData();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<HistorySession | null>(null);

  const filtered = sessions.filter((s) => !typeFilter || s.type === typeFilter);

  if (isLoading) return <p className="text-muted">Đang tải lịch sử...</p>;
  if (error) return <p className="text-danger">Lỗi: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Lịch sử</h1>

      <div className="flex flex-wrap gap-2">
        <FilterButton label="Tất cả" active={typeFilter === null} onClick={() => setTypeFilter(null)} />
        {Object.entries(TYPE_LABEL).map(([value, label]) => (
          <FilterButton
            key={value}
            label={label}
            active={typeFilter === value}
            onClick={() => setTypeFilter(value)}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-muted text-sm">Chưa có buổi nào.</p>}
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                selected?.id === s.id
                  ? "bg-primary/10 border-primary"
                  : "bg-surface border-border hover:border-primary"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{s.topic ?? "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted">{TYPE_LABEL[s.type] ?? s.type}</span>
                <span className="text-xs text-muted">·</span>
                <span className="text-xs text-muted">
                  {new Date(s.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div>
          {selected ? (
            <SessionDetailPanel session={selected} />
          ) : (
            <div className="p-8 text-center rounded-md bg-surface border border-border text-muted text-sm">
              Chọn 1 buổi bên trái để xem chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionDetailPanel({ session }: { session: HistorySession }) {
  const { detail, isLoading, error } = useSessionDetail(session.id, session.type);

  if (isLoading) return <p className="text-muted text-sm">Đang tải chi tiết...</p>;
  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!detail) return <p className="text-muted text-sm">Không có dữ liệu.</p>;

  if (detail.type === "interview") {
    return (
      <div className="space-y-4">
        {detail.items.map((item, i) => (
          <div key={i} className="p-3 rounded-md bg-surface border border-border space-y-2">
            <p className="text-sm font-medium text-foreground">{item.question}</p>
            <p className="text-sm text-foreground/70 whitespace-pre-wrap">{item.userAnswer}</p>
            {item.score !== null && (
              <p className="text-xs text-primary font-medium">Điểm: {item.score}/10</p>
            )}
            {item.aiFeedback && (
              <p className="text-xs text-foreground/60 whitespace-pre-wrap border-t border-border pt-2">
                {item.aiFeedback}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (detail.type === "code_review") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted">Ngôn ngữ: {detail.language}</p>
        <pre className="bg-background border border-border rounded-md p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
          {detail.codeInput}
        </pre>
        <div className="p-3 rounded-md bg-surface border border-border text-sm text-foreground/80 whitespace-pre-wrap">
          {(() => {
            try {
              const parsed = JSON.parse(detail.aiReview);
              return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n\n");
            } catch {
              return detail.aiReview;
            }
          })()}
        </div>
      </div>
    );
  }

  if (detail.type === "jd_analysis") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-foreground">Level: {detail.level}</p>
        <div className="flex flex-wrap gap-2">
          {detail.techStack.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
              {t}
            </span>
          ))}
        </div>
        <details className="text-sm text-foreground/70">
          <summary className="cursor-pointer text-primary">Xem JD gốc</summary>
          <p className="mt-2 whitespace-pre-wrap">{detail.jdText}</p>
        </details>
      </div>
    );
  }

  return null;
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-foreground hover:border-primary hover:bg-surface-hover"
      }`}
    >
      {label}
    </button>
  );
}