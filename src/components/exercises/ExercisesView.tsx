"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──
type Difficulty = "Easy" | "Medium" | "Hard";

export type Exercise = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  suggestedLanguage: string;
  description: string;
  example: string;
  hint: string;
};

// ── Static data ──
export const CATEGORIES = ["Array", "String", "Tree", "DP", "Graph"] as const;
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const EXERCISES: Exercise[] = [
  {
    id: "1",
    title: "Two Sum",
    category: "Array",
    difficulty: "Easy",
    suggestedLanguage: "JavaScript",
    description: "Cho mảng số nguyên nums và số nguyên target, trả về chỉ số của hai số có tổng bằng target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    hint: "Dùng HashMap để lưu giá trị đã duyệt qua.",
  },
  {
    id: "2",
    title: "Valid Parentheses",
    category: "String",
    difficulty: "Easy",
    suggestedLanguage: "JavaScript",
    description: "Kiểm tra chuỗi ngoặc có hợp lệ không (mở/đóng đúng thứ tự).",
    example: "Input: '()[]{}'  → Output: true\nInput: '([)]'   → Output: false",
    hint: "Dùng Stack, push khi gặp mở ngoặc, pop khi gặp đóng ngoặc.",
  },
  {
    id: "3",
    title: "Longest Substring Without Repeating",
    category: "String",
    difficulty: "Medium",
    suggestedLanguage: "JavaScript",
    description: "Tìm độ dài chuỗi con dài nhất không có ký tự lặp.",
    example: "Input: 'abcabcbb'\nOutput: 3 ('abc')",
    hint: "Sliding window + Set để track ký tự hiện tại.",
  },
  {
    id: "4",
    title: "Binary Tree Level Order Traversal",
    category: "Tree",
    difficulty: "Medium",
    suggestedLanguage: "JavaScript",
    description: "Duyệt cây nhị phân theo từng tầng (BFS), trả về mảng 2 chiều.",
    example: "Input: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
    hint: "Dùng Queue (BFS), mỗi lần lấy hết node của một level ra.",
  },
  {
    id: "5",
    title: "Climbing Stairs",
    category: "DP",
    difficulty: "Easy",
    suggestedLanguage: "JavaScript",
    description: "Có n bậc thang, mỗi lần leo 1 hoặc 2 bậc. Tính số cách leo lên đỉnh.",
    example: "Input: n = 3\nOutput: 3 (1+1+1, 1+2, 2+1)",
    hint: "Fibonacci! dp[i] = dp[i-1] + dp[i-2]",
  },
  {
    id: "6",
    title: "Number of Islands",
    category: "Graph",
    difficulty: "Medium",
    suggestedLanguage: "Python",
    description: "Đếm số đảo trong ma trận 2D ('1' = đất, '0' = nước).",
    example: "Input: grid = [['1','1','0'],['0','1','0'],['0','0','1']]\nOutput: 2",
    hint: "DFS hoặc BFS từ mỗi ô '1' chưa được visit, đánh dấu connected cells.",
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; bg: string; border: string; label: string }> = {
  Easy:   { color: "var(--success)", bg: "var(--success-bg)", border: "rgba(52,211,153,0.3)", label: "Dễ" },
  Medium: { color: "var(--warning)", bg: "var(--warning-bg)", border: "rgba(251,191,36,0.3)",  label: "Trung bình" },
  Hard:   { color: "var(--danger)",  bg: "var(--danger-bg)",  border: "rgba(248,113,113,0.3)", label: "Khó" },
};

const CATEGORY_ICONS: Record<string, string> = {
  Array:  "📊",
  String: "🔤",
  Tree:   "🌳",
  DP:     "🧮",
  Graph:  "🕸️",
};

// ── Component ──
export default function ExercisesView() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [showHint, setShowHint] = useState(false);

  const filtered = EXERCISES.filter(
    (ex) =>
      (!categoryFilter || ex.category === categoryFilter) &&
      (!difficultyFilter || ex.difficulty === difficultyFilter)
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          💻 Bài tập Coding
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Luyện các bài toán phổ biến trong phỏng vấn kỹ thuật
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Category filter */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Tất cả"
              active={categoryFilter === null}
              onClick={() => setCategoryFilter(null)}
            />
            {CATEGORIES.map((c) => (
              <FilterPill
                key={c}
                label={`${CATEGORY_ICONS[c] ?? ""} ${c}`}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(c)}
              />
            ))}
          </div>
        </div>

        {/* Difficulty filter */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
            Độ khó
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Tất cả"
              active={difficultyFilter === null}
              onClick={() => setDifficultyFilter(null)}
            />
            {DIFFICULTIES.map((d) => {
              const config = DIFFICULTY_CONFIG[d];
              return (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    background: difficultyFilter === d ? config.bg : "var(--surface-2)",
                    border: `1px solid ${difficultyFilter === d ? config.border : "var(--border-bright)"}`,
                    color: difficultyFilter === d ? config.color : "var(--foreground-2)",
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Hiển thị {filtered.length} / {EXERCISES.length} bài tập
      </p>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Exercise list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "var(--surface)", border: "1px dashed var(--border-bright)" }}
            >
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Không có bài nào khớp filter.
              </p>
            </div>
          )}
          {filtered.map((ex, i) => {
            const config = DIFFICULTY_CONFIG[ex.difficulty];
            const isSelected = selected?.id === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => { setSelected(ex); setShowHint(false); }}
                className="w-full text-left rounded-xl p-4 transition-all duration-200 animate-fadeIn"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  background: isSelected ? "rgba(139,92,246,0.08)" : "var(--surface)",
                  border: `1px solid ${isSelected ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                  borderLeft: `3px solid ${isSelected ? "var(--primary)" : config.color}`,
                  boxShadow: isSelected ? "0 0 16px rgba(139,92,246,0.1)" : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: isSelected ? "var(--primary-light)" : "var(--foreground)" }}
                    >
                      {ex.title}
                    </p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>
                      {ex.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 items-end">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "var(--surface-hover)",
                        color: "var(--foreground-2)",
                        border: "1px solid var(--border-bright)",
                      }}
                    >
                      {CATEGORY_ICONS[ex.category]} {ex.category}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="sticky top-20">
          {selected ? (
            <div
              className="rounded-2xl overflow-hidden animate-scaleIn"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Detail header */}
              <div
                className="p-5"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <h2
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {selected.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "var(--surface)",
                      color: "var(--foreground-2)",
                      border: "1px solid var(--border-bright)",
                    }}
                  >
                    {CATEGORY_ICONS[selected.category]} {selected.category}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: DIFFICULTY_CONFIG[selected.difficulty].bg,
                      color: DIFFICULTY_CONFIG[selected.difficulty].color,
                      border: `1px solid ${DIFFICULTY_CONFIG[selected.difficulty].border}`,
                    }}
                  >
                    {DIFFICULTY_CONFIG[selected.difficulty].label}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "var(--primary-light)",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                  >
                    {selected.suggestedLanguage}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4" style={{ background: "var(--surface)" }}>
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Đề bài
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-2)" }}>
                    {selected.description}
                  </p>
                </div>

                {/* Example */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Ví dụ
                  </p>
                  <pre
                    className="text-xs p-3 rounded-xl overflow-x-auto"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-bright)",
                      color: "var(--foreground-2)",
                      fontFamily: "'Geist Mono', monospace",
                      lineHeight: 1.7,
                    }}
                  >
                    {selected.example}
                  </pre>
                </div>

                {/* Hint */}
                <div>
                  <button
                    onClick={() => setShowHint((v) => !v)}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: "var(--primary-light)" }}
                  >
                    💡 {showHint ? "Ẩn gợi ý" : "Hiện gợi ý"}
                  </button>
                  {showHint && (
                    <div
                      className="mt-2 p-3 rounded-xl animate-fadeIn"
                      style={{ background: "var(--info-bg)", border: "1px solid rgba(96,165,250,0.2)" }}
                    >
                      <p className="text-sm" style={{ color: "var(--info)" }}>
                        {selected.hint}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href="/code-review"
                  className="btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                >
                  🚀 Làm xong → Mở Code Review
                </Link>
              </div>
            </div>
          ) : (
            <div
              className="py-16 text-center rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border-bright)",
              }}
            >
              <div className="text-4xl mb-3 animate-float">👆</div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground-2)" }}>
                Chọn 1 bài tập bên trái
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                để xem mô tả, ví dụ và gợi ý
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        background: active ? "var(--gradient-primary)" : "var(--surface-2)",
        border: `1px solid ${active ? "transparent" : "var(--border-bright)"}`,
        color: active ? "white" : "var(--foreground-2)",
        boxShadow: active ? "0 2px 8px var(--primary-glow)" : "none",
      }}
    >
      {label}
    </button>
  );
}