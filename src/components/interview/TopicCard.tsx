"use client";

import type { GroupableTopic } from "@/hooks/useTopicGrouping";

function getTopicLogo(topicName: string) {
  const name = topicName.toLowerCase();
  if (name.includes("react native")) return "/logo/react-native-removebg-preview.png";
  if (name.includes("react")) return "/logo/reactjs.png";
  if (name.includes("html")) return "/logo/HTML5_logo_resized.png";
  if (name.includes("css") || name.includes("tailwind")) return "/logo/css.png";
  if (name.includes("typescript")) return "/logo/typescript-logo-png_seeklogo-526730.png";
  if (name.includes("javascript")) return "/logo/javascript.png";
  if (name.includes("node")) return "/logo/nodejs-new.png";
  if (name.includes("next")) return "/logo/nextjs-new.png";
  if (name.includes("mongo")) return "/logo/MongoDB-Emblem-2048x1280-removebg-preview.png";
  if (name.includes("docker")) return "/logo/docker-mark-ocean-blue-removebg-preview.png";
  if (name.includes("kỹ năng mềm") || name.includes("soft skill")) return "/logo/soft-skill.png";
  if (name.includes("sql")) return "/logo/sql.png";
  if (name.includes("git")) return "/logo/git5-removebg-preview.png";
  if (name.includes(".net") || name.includes("c#")) return "/logo/dotnet_.png";
  return "📝";
}

export function TopicLogo({ name, className }: { name: string; className?: string }) {
  const logo = getTopicLogo(name);
  return logo.startsWith("/")
    ? <img src={logo} alt={name} className={className ?? "w-full h-full object-contain"} />
    : <span className="text-2xl">{logo}</span>;
}

interface TopicCardProps<T extends GroupableTopic> {
  topic: T;
  mode: "quick" | "custom";
  active: boolean;
  onCardClick: () => void;

  // quick mode
  isSelectedQuick: boolean;
  quickCount: number;
  onQuickCountChange: (val: number) => void;

  // custom mode
  isCategorySelectedCustom: boolean;
  customMax: number;
  customCount: number;
  onCustomCountChange: (val: number) => void;
}

export function TopicCard<T extends GroupableTopic>({
  topic,
  mode,
  active,
  onCardClick,
  isSelectedQuick,
  quickCount,
  onQuickCountChange,
  isCategorySelectedCustom,
  customMax,
  customCount,
  onCustomCountChange,
}: TopicCardProps<T>) {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
      onClick={onCardClick}
      style={{
        background: active ? "rgba(139,92,246,0.12)" : "var(--surface)",
        border: `1px solid ${active ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? "0 10px 25px -5px rgba(139,92,246,0.2)" : "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
          <TopicLogo name={topic.name} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] leading-snug break-words text-foreground group-hover:text-primary transition-colors">
            {topic.name}
          </p>
          <p className="text-xs text-muted mt-1">Có sẵn {topic.questionCount} câu</p>
        </div>

        <div
          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
            active ? "bg-primary border-primary" : "border-muted"
          }`}
        >
          {active && <span className="text-white text-xs font-bold">✓</span>}
        </div>
      </div>

      {mode === "quick" && isSelectedQuick && (
        <div className="pt-3 border-t border-border mt-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between animate-fadeIn">
            <span className="text-sm font-medium text-muted">Số câu chọn:</span>
            <input
              type="number"
              min={1}
              max={topic.questionCount}
              value={quickCount}
              onChange={(e) => onQuickCountChange(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm font-bold rounded-lg bg-surface-2 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center transition-all"
            />
          </div>
        </div>
      )}

      {mode === "custom" && isCategorySelectedCustom && (
        <div className="pt-3 border-t border-border mt-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between animate-fadeIn">
            <span className="text-sm font-medium text-muted">
              Số câu chọn:
              <span className="text-xs text-primary ml-1">(max {customMax})</span>
            </span>
            <input
              type="number"
              min={1}
              max={customMax}
              value={customCount}
              onChange={(e) => onCustomCountChange(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm font-bold rounded-lg bg-surface-2 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}