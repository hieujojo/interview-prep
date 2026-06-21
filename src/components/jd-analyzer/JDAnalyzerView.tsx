"use client";

import type { JDAnalysisResult } from "@/hooks/useJDAnalysis";

type Props = {
  jdText: string;
  onChangeJdText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
  result: JDAnalysisResult | null;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | null;
};

export default function JDAnalyzerView({
  jdText,
  onChangeJdText,
  onAnalyze,
  isAnalyzing,
  error,
  result,
}: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Phân tích JD & Sinh câu hỏi</h1>

      <div>
        <p className="text-sm text-muted mb-2">Paste nội dung Job Description</p>
        <textarea
          value={jdText}
          onChange={(e) => onChangeJdText(e.target.value)}
          rows={10}
          placeholder="Paste toàn bộ nội dung JD vào đây, không cần format..."
          className="w-full bg-surface border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        onClick={onAnalyze}
        disabled={jdText.trim().length < 50 || isAnalyzing}
        className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? "Đang phân tích..." : "Phân tích JD"}
      </button>

      {result && (
        <div className="space-y-6">
          {/* Tổng quan */}
          <div className="border border-border rounded-md p-4 bg-surface space-y-3">
            <div>
              <p className="text-sm text-muted mb-1">Level ước tính</p>
              <p className="text-foreground font-semibold">{result.level}</p>
              <p className="text-sm text-foreground/70 mt-1">{result.levelReason}</p>
            </div>

            <div>
              <p className="text-sm text-muted mb-2">Tech stack</p>
              <div className="flex flex-wrap gap-2">
                {result.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted mb-2">Kỹ năng trọng tâm</p>
              <div className="flex flex-wrap gap-2">
                {result.focusSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs bg-surface-hover text-foreground border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Câu hỏi gợi ý */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Bộ câu hỏi gợi ý ({result.questions.length})
            </h2>
            <div className="space-y-2">
              {result.questions.map((q, i) => (
                <div
                  key={i}
                  className="p-3 rounded-md bg-surface border border-border flex items-start justify-between gap-3"
                >
                  <p className="text-sm text-foreground">{q.content}</p>
                  <div className="flex gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-xs bg-info/20 text-info">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-warning/20 text-warning">
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bài tập coding */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Bài tập coding gợi ý</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {result.exercises.map((ex, i) => (
                <div key={i} className="p-3 rounded-md bg-surface border border-border">
                  <p className="text-sm font-medium text-foreground">{ex.title}</p>
                  <p className="text-xs text-muted mt-1">{ex.description}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-surface-hover text-foreground">
                    {ex.language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}