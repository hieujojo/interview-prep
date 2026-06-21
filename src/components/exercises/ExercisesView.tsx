"use client";

import { useState } from "react";
import Link from "next/link";
import { EXERCISES, CATEGORIES, DIFFICULTIES, type Exercise } from "@/static/exercises";

export default function ExercisesView() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = EXERCISES.filter(
    (ex) =>
      (!categoryFilter || ex.category === categoryFilter) &&
      (!difficultyFilter || ex.difficulty === difficultyFilter)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bài tập Coding</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Tất cả category"
            active={categoryFilter === null}
            onClick={() => setCategoryFilter(null)}
          />
          {CATEGORIES.map((c) => (
            <FilterButton
              key={c}
              label={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Tất cả độ khó"
            active={difficultyFilter === null}
            onClick={() => setDifficultyFilter(null)}
          />
          {DIFFICULTIES.map((d) => (
            <FilterButton
              key={d}
              label={d}
              active={difficultyFilter === d}
              onClick={() => setDifficultyFilter(d)}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-2">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelected(ex)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                selected?.id === ex.id
                  ? "bg-primary/10 border-primary"
                  : "bg-surface border-border hover:border-primary"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{ex.title}</p>
              <div className="flex gap-2 mt-1">
                <Tag>{ex.category}</Tag>
                <DifficultyTag difficulty={ex.difficulty} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted text-sm">Không có bài tập nào khớp filter.</p>
          )}
        </div>

        {/* Detail */}
        <div>
          {selected ? <ExerciseDetail exercise={selected} /> : (
            <div className="p-8 text-center rounded-md bg-surface border border-border text-muted text-sm">
              Chọn 1 bài tập bên trái để xem chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="p-4 rounded-md bg-surface border border-border space-y-4 sticky top-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{exercise.title}</h2>
        <div className="flex gap-2 mt-1">
          <Tag>{exercise.category}</Tag>
          <DifficultyTag difficulty={exercise.difficulty} />
          <Tag>{exercise.suggestedLanguage}</Tag>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-1">Đề bài</p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{exercise.description}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-1">Ví dụ</p>
        <pre className="bg-background border border-border rounded-md p-3 text-xs text-foreground whitespace-pre-wrap">
          {exercise.example}
        </pre>
      </div>

      <div>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="text-sm text-primary hover:underline"
        >
          {showHint ? "Ẩn gợi ý" : "💡 Hiện gợi ý"}
        </button>
        {showHint && (
          <p className="text-sm text-foreground/80 mt-2 p-3 bg-background border border-border rounded-md">
            {exercise.hint}
          </p>
        )}
      </div>

      <Link
        href="/code-review"
        className="inline-block px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        Làm xong → Mở Code Review
      </Link>
    </div>
  );
}

function FilterButton({
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
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-foreground hover:border-primary hover:bg-surface-hover"
      }`}
    >
      {label}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-surface-hover text-foreground">
      {children}
    </span>
  );
}

function DifficultyTag({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    Easy: "bg-success/20 text-success",
    Medium: "bg-warning/20 text-warning",
    Hard: "bg-danger/20 text-danger",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colorMap[difficulty] ?? ""}`}>
      {difficulty}
    </span>
  );
}