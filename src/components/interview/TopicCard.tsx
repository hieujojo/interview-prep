"use client";

import type { GroupableTopic } from "@/hooks/useTopicGrouping";

function getTopicLogo(topicName: string): { src: string; dark?: boolean; large?: boolean; wide?: boolean } {
  const name = topicName.toLowerCase();
  if (name.includes("html")) return { src: "/logo/HTML5_logo_resized.png" };
  if (name.includes("css") || name.includes("tailwind")) return { src: "/logo/css.png" };
  if (name.includes("javascript")) return { src: "/logo/javascript.png" };
  if (name.includes("typescript")) return { src: "/logo/typescript-logo-png_seeklogo-526730.png" };
  if (name.includes("react native")) return { src: "/logo/react-native-removebg-preview.png" };
  if (name.includes("react")) return { src: "/logo/reactjs.png" };
  if (name.includes("node")) return { src: "/logo/nodejs.png" };
  if (name.includes("next")) return { src: "/logo/nextjs.png", dark: true };
  if (name.includes("mongo")) return { src: "/logo/MongoDB-Emblem-2048x1280-removebg-preview.png" };
  if (name.includes("docker")) return { src: "/logo/docker-mark-ocean-blue-removebg-preview.png", wide: true };
  if (name.includes("kỹ năng mềm") || name.includes("soft skill")) return { src: "/logo/soft-skills.png", dark: true, wide: true };
  if (name.includes("sql")) return { src: "/logo/mysql.png" };
  if (name.includes("git")) return { src: "/logo/git5-removebg-preview.png", wide: true };
  if (name.includes("c#")) return { src: "/logo/c_sharp_logo.png" };
  if (name.includes(".net")) return { src: "/logo/dotnet.png", large: true, wide: true };
  if (name.includes("design system") || name.includes("system design") || name.includes("kiến trúc")) return { src: "/logo/design-system.png", large: true, wide: true };
  if (name.includes("dsa") || name.includes("thuật toán") || name.includes("cấu trúc dữ liệu")) return { src: "/logo/dsa.png", large: true, wide: true };
  return { src: "📝" };
}

/** Export để TopicCategorySection biết topic nào cần card rộng hơn */
export function isWideTopic(topicName: string): boolean {
  return !!getTopicLogo(topicName).wide;
}

export function TopicLogo({ name, className }: { name: string; className?: string }) {
  const logo = getTopicLogo(name);

  if (!logo.src.startsWith("/")) {
    return <span className="text-4xl">{logo.src}</span>;
  }

  const baseClass = className ?? (logo.large ? "w-14 h-14 object-contain" : "w-12 h-12 object-contain");
  const bgClass = logo.dark ? " bg-white p-1.5 rounded-xl shadow-sm" : "";

  return <img src={logo.src} alt={name} className={baseClass + bgClass} />;
}

interface TopicCardProps<T extends GroupableTopic> {
  topic: T;
  mode: "quick" | "custom";
  active: boolean;
  onCardClick: () => void;
  className?: string;

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
  className,
}: TopicCardProps<T>) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer ${className ?? ""}`}
      onClick={onCardClick}
      style={{
        background: active ? "rgba(139,92,246,0.12)" : "var(--surface)",
        border: `1px solid ${active ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? "0 10px 25px -5px rgba(139,92,246,0.2)" : "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 flex items-center justify-center min-w-[48px] min-h-[48px]">
          <TopicLogo name={topic.name} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-[15px] leading-snug break-words text-foreground group-hover:text-primary transition-colors"
            title={topic.name}
          >
            {topic.name}
          </p>
          <p className="text-xs text-muted mt-1">Có sẵn {topic.questionCount} câu</p>
        </div>

        <div
          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary border-primary" : "border-muted"
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