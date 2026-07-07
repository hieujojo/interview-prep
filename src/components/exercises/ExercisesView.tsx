"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";
import { useExercises, type Exercise, type Difficulty } from "@/hooks/useExercises";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", icon: "🟨" },
  { label: "TypeScript", value: "typescript", icon: "🔷" },
  { label: "Python",     value: "python",     icon: "🐍" },
  { label: "Go",         value: "go",         icon: "🔵" },
  { label: "Java",       value: "java",       icon: "☕" },
  { label: "SQL",        value: "sql",        icon: "🗄️" },
  { label: "Other",      value: "plaintext",  icon: "📄" },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; bg: string; border: string; label: string }> = {
  beginner: { color: "var(--info)",    bg: "var(--info-bg)",    border: "rgba(96,165,250,0.3)",  label: "Mới bắt đầu" },
  junior:   { color: "var(--success)", bg: "var(--success-bg)", border: "rgba(52,211,153,0.3)",  label: "Junior" },
  mid:      { color: "var(--warning)", bg: "var(--warning-bg)", border: "rgba(251,191,36,0.3)",  label: "Mid" },
  senior:   { color: "var(--danger)",  bg: "var(--danger-bg)",  border: "rgba(248,113,113,0.3)", label: "Senior" },
  expert:   { color: "var(--primary-light)", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", label: "Expert" },
};

const DIFFICULTIES: Difficulty[] = ["beginner", "junior", "mid", "senior", "expert"];

const REVIEW_SECTIONS = [
  { key: "syntaxErrors",   icon: "🔴", label: "Lỗi cú pháp",    severity: "danger" },
  { key: "logicErrors",    icon: "🟠", label: "Lỗi logic",      severity: "warning" },
  { key: "edgeCases",      icon: "🟡", label: "Edge cases",     severity: "warning" },
  { key: "performance",    icon: "🔵", label: "Performance",    severity: "info" },
  { key: "bestPractices",  icon: "🟢", label: "Best practices", severity: "success" },
  { key: "security",       icon: "🛡️", label: "Security",       severity: "info" },
] as const;

const SEVERITY_STYLE = {
  danger:  { color: "var(--danger)",  bg: "var(--danger-bg)"  },
  warning: { color: "var(--warning)", bg: "var(--warning-bg)" },
  info:    { color: "var(--info)",    bg: "var(--info-bg)"    },
  success: { color: "var(--success)", bg: "var(--success-bg)" },
};

export default function ExercisesView() {
  // ── Picker state ──
  const [showPicker, setShowPicker] = useState(true);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showHint, setShowHint] = useState(false);

  const {
    topics,
    exercises,
    isLoadingExercises,
    exercisesError,
    isExercisesEmpty,
    review,
    result,
    isReviewing,
    reviewError,
    saveWarning,
    resetReview,
  } = useExercises({ topicId: topicFilter, difficulty: difficultyFilter });

  // ── Editor state ──
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["syntaxErrors", "logicErrors"])
  );

  const handleSelectExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setShowHint(false);
    setContext(`Đề bài: ${ex.title}\n${ex.description}${ex.example ? `\n\nVí dụ:\n${ex.example}` : ""}`);
    if (ex.suggested_language) {
      const match = LANGUAGES.find(
        (l) => l.label.toLowerCase() === ex.suggested_language!.toLowerCase()
      );
      if (match) setLanguage(match.value);
    }
    setCode("");
    resetReview();
  };

  const handleFreeMode = () => {
    setSelectedExercise(null);
    setContext("");
    resetReview();
  };

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

  const handleReview = () => {
    review(language, context, code, selectedExercise?.id ?? null);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold mb-1" style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            💻 Luyện Code
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Chọn bài tập hoặc tự viết code, AI sẽ review chi tiết ngay sau khi bạn hoàn thành
          </p>
        </div>
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0"
          style={{
            background: showPicker ? "var(--gradient-primary)" : "var(--surface-2)",
            border: `1px solid ${showPicker ? "transparent" : "var(--border-bright)"}`,
            color: showPicker ? "white" : "var(--foreground-2)",
          }}
        >
          {showPicker ? "📖 Ẩn danh sách bài tập" : "📖 Chọn bài tập"}
        </button>
      </div>

      <div className={`grid gap-6 items-start ${showPicker ? "lg:grid-cols-[380px_1fr]" : "grid-cols-1"}`}>
        {/* ── Panel chọn bài (trái, có thể ẩn) ── */}
        {showPicker && (
          <div className="space-y-3">
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Chủ đề</p>
                <div className="flex flex-wrap gap-1.5">
                  <FilterPill label="Tất cả" active={topicFilter === null} onClick={() => setTopicFilter(null)} />
                  {topics.map((t) => (
                    <FilterPill
                      key={t.id}
                      label={t.name}
                      active={topicFilter === t.id}
                      onClick={() => setTopicFilter(t.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Độ khó</p>
                <div className="flex flex-wrap gap-1.5">
                  <FilterPill label="Tất cả" active={difficultyFilter === null} onClick={() => setDifficultyFilter(null)} />
                  {DIFFICULTIES.map((d) => {
                    const cfg = DIFFICULTY_CONFIG[d];
                    return (
                      <button
                        key={d}
                        onClick={() => setDifficultyFilter(d)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
                        style={{
                          background: difficultyFilter === d ? cfg.bg : "var(--surface-2)",
                          border: `1px solid ${difficultyFilter === d ? cfg.border : "var(--border-bright)"}`,
                          color: difficultyFilter === d ? cfg.color : "var(--foreground-2)",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleFreeMode}
              className="w-full text-left rounded-xl p-3 text-sm font-medium transition-all duration-200"
              style={{
                background: !selectedExercise ? "rgba(139,92,246,0.08)" : "var(--surface)",
                border: `1px solid ${!selectedExercise ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                color: !selectedExercise ? "var(--primary-light)" : "var(--foreground-2)",
              }}
            >
              ✏️ Tự viết code tự do (không chọn bài)
            </button>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {isLoadingExercises && (
                <>
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                </>
              )}

              {exercisesError && (
                <p className="text-sm px-3 py-2 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
                  {exercisesError}
                </p>
              )}

              {isExercisesEmpty && (
                <div className="rounded-xl p-5 text-center" style={{ background: "var(--surface)", border: "1px dashed var(--border-bright)" }}>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Không có bài nào khớp filter.</p>
                </div>
              )}

              {exercises.map((ex, i) => {
                const cfg = DIFFICULTY_CONFIG[ex.difficulty];
                const isSelected = selectedExercise?.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className="w-full text-left rounded-xl p-3 transition-all duration-200 animate-fadeIn"
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      background: isSelected ? "rgba(139,92,246,0.08)" : "var(--surface)",
                      border: `1px solid ${isSelected ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                      borderLeft: `3px solid ${isSelected ? "var(--primary)" : cfg.color}`,
                    }}
                  >
                    <p className="text-sm font-semibold truncate" style={{ color: isSelected ? "var(--primary-light)" : "var(--foreground)" }}>
                      {ex.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface-hover)", color: "var(--foreground-2)" }}>
                        {ex.topics?.name ?? "—"}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Editor + Review (phải) ── */}
        <div className="space-y-6">
          {selectedExercise && (
            <div
              className="rounded-2xl p-4 animate-scaleIn"
              style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold" style={{ color: "var(--primary-light)" }}>
                  📌 {selectedExercise.title}
                </h3>
                <button
                  onClick={handleFreeMode}
                  className="text-xs shrink-0"
                  style={{ color: "var(--muted)" }}
                >
                  ✕ Bỏ chọn
                </button>
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                {selectedExercise.description}
              </p>
              {selectedExercise.example && (
                <pre
                  className="text-xs mt-2 p-2.5 rounded-lg overflow-x-auto"
                  style={{ background: "var(--surface-2)", color: "var(--foreground-2)", fontFamily: "'Geist Mono', monospace" }}
                >
                  {selectedExercise.example}
                </pre>
              )}
              {selectedExercise.hint && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowHint((v) => !v)}
                    className="text-xs font-medium"
                    style={{ color: "var(--primary-light)" }}
                  >
                    💡 {showHint ? "Ẩn gợi ý" : "Hiện gợi ý"}
                  </button>
                  {showHint && (
                    <p className="text-xs mt-1.5 p-2.5 rounded-lg" style={{ background: "var(--info-bg)", color: "var(--info)" }}>
                      {selectedExercise.hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Language selector */}
          <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Ngôn ngữ</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = language === lang.value;
                return (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
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
          <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <label className="text-sm font-semibold block mb-2" style={{ color: "var(--foreground)" }}>
              Mô tả context
              <span className="ml-1.5 font-normal text-xs" style={{ color: "var(--muted)" }}>(tuỳ chọn)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="Đề bài là gì, mục đích của đoạn code này..."
              className="w-full text-sm rounded-xl p-3 resize-none focus:outline-none transition-all duration-200"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-bright)")}
            />
          </div>

          {/* Code editor */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
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
              <span className="text-xs" style={{ color: "var(--muted)" }}>{code.split("\n").length} dòng</span>
            </div>
            <Editor
              height="380px"
              language={language}
              value={code}
              onChange={(value) => setCode(value ?? "")}
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

          {reviewError && (
            <p className="text-sm px-4 py-3 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
              {reviewError}
            </p>
          )}

          <button
            onClick={handleReview}
            disabled={!code.trim() || isReviewing}
            className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
          >
            {isReviewing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                Đang phân tích...
              </>
            ) : (
              "✨ AI Review"
            )}
          </button>

          {result && (
            <div className="space-y-3 animate-fadeInUp">
              <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>📝 Kết quả Review</h2>

              {saveWarning && (
                <p className="text-xs px-3 py-2 rounded-xl" style={{ color: "var(--warning)", background: "var(--warning-bg)" }}>
                  ⚠️ {saveWarning}
                </p>
              )}

              {REVIEW_SECTIONS.map(({ key, icon, label, severity }) => {
                const content = result[key as keyof typeof result] as string;
                const style = SEVERITY_STYLE[severity];
                const expanded = expandedSections.has(key);

                return (
                  <div key={key} className="rounded-xl overflow-hidden transition-all duration-200" style={{ border: `1px solid ${style.color}25` }}>
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                      style={{ background: style.bg }}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: style.color }}>
                        <span>{icon}</span>{label}
                      </span>
                      <span className="text-xs transition-transform duration-200" style={{ color: style.color, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                    </button>
                    {expanded && (
                      <div className="px-4 py-3 animate-fadeIn" style={{ background: "var(--surface)" }}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                          {content || "Không có vấn đề."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.25)" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(139,92,246,0.08)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                  <span className="text-sm font-semibold" style={{ color: "var(--primary-light)" }}>✨ Code cải thiện</span>
                  <button
                    onClick={() => handleCopy(result.improvedCode)}
                    className="text-xs px-3 py-1 rounded-lg transition-all duration-200"
                    style={{
                      background: copied ? "var(--success-bg)" : "rgba(139,92,246,0.15)",
                      color: copied ? "var(--success)" : "var(--primary-light)",
                    }}
                  >
                    {copied ? "✅ Đã copy" : "📋 Copy"}
                  </button>
                </div>
                <pre
                  className="p-4 text-xs overflow-x-auto"
                  style={{ background: "var(--surface)", color: "var(--foreground-2)", fontFamily: "'Geist Mono', 'Fira Code', monospace", lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                >
                  {result.improvedCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        background: active ? "var(--gradient-primary)" : "var(--surface-2)",
        border: `1px solid ${active ? "transparent" : "var(--border-bright)"}`,
        color: active ? "white" : "var(--foreground-2)",
      }}
    >
      {label}
    </button>
  );
}