"use client";

import { TopicCard, isWideTopic } from "./TopicCard";
import type { GroupableTopic, TopicGroup } from "@/hooks/useTopicGrouping";

interface TopicCategorySectionProps<T extends GroupableTopic> {
  group: TopicGroup<T>;
  mode: "quick" | "custom";

  selectedTopics: Record<string, number>;
  expandedTopics: Set<string>;
  categorySelections: Map<string, Set<string>>;

  onToggleTopic: (name: string, maxCount: number) => void;
  onExpandTopic: (name: string) => void;
  onCollapseTopic: (name: string) => void;
  onClearCategorySelection: (name: string) => void;
  onUpdateCount: (name: string, count: number, max: number) => void;
  setCountForTopic: (name: string, count: number) => void;
  getMaxForTopic: (topic: T) => number;
  getCountForTopic: (name: string, fallback: number) => number;
}

export function TopicCategorySection<T extends GroupableTopic>({
  group,
  mode,
  selectedTopics,
  expandedTopics,
  categorySelections,
  onToggleTopic,
  onExpandTopic,
  onCollapseTopic,
  onClearCategorySelection,
  onUpdateCount,
  setCountForTopic,
  getMaxForTopic,
  getCountForTopic,
}: TopicCategorySectionProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none">{group.icon}</span>
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">{group.label}</h3>
        <span className="text-xs font-semibold text-muted">({group.topics.length})</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* flex-wrap: card co giãn theo độ dài title, wide topics tự động rộng hơn */}
      <div className="flex flex-wrap gap-4">
        {group.topics.map((topic) => {
          const active =
            mode === "quick"
              ? !!selectedTopics[topic.name]
              : expandedTopics.has(topic.name) || categorySelections.has(topic.name);

          const customMax = getMaxForTopic(topic);

          const handleCardClick = () => {
            if (mode === "quick") {
              onToggleTopic(topic.name, topic.questionCount);
              return;
            }
            const isCurrentlyExpanded = expandedTopics.has(topic.name);
            const hasCategories = categorySelections.has(topic.name);
            if (isCurrentlyExpanded || hasCategories) {
              onCollapseTopic(topic.name);
              onClearCategorySelection(topic.name);
            } else {
              onExpandTopic(topic.name);
            }
          };

          // Wide topics: width tỷ lệ với độ dài tên, narrow topics: 240px cố định
          const cardWidth = isWideTopic(topic.name)
            ? Math.max(260, Math.min(topic.name.length * 9 + 80, 480))
            : 240;

          return (
            <div key={topic.id} style={{ width: cardWidth }}>
              <TopicCard
                className="h-full w-full"
                topic={topic}
                mode={mode}
                active={active}
                onCardClick={handleCardClick}
                isSelectedQuick={!!selectedTopics[topic.name]}
                quickCount={selectedTopics[topic.name] ?? 0}
                onQuickCountChange={(val) => onUpdateCount(topic.name, val, topic.questionCount)}
                isCategorySelectedCustom={categorySelections.has(topic.name)}
                customMax={customMax}
                customCount={getCountForTopic(topic.name, customMax)}
                onCustomCountChange={(val) => setCountForTopic(topic.name, Math.min(val, customMax))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}