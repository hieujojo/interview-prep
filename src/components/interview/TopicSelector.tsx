"use client";

import { useState } from "react";
import { TOPIC_GROUPS, QUESTION_COUNT_OPTIONS } from "@/static/topics";

type TopicSelectorProps = {
  onStart: (topic: string, count: number) => void;
};

export default function TopicSelector({ onStart }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">1. Chọn topic</h2>
        <div className="space-y-4">
          {TOPIC_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-sm text-muted mb-2">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedTopic === topic
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:border-primary hover:bg-surface-hover"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">2. Số câu hỏi</h2>
        <div className="flex gap-2">
          {QUESTION_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                selectedCount === count
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary hover:bg-surface-hover"
              }`}
            >
              {count} câu
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!selectedTopic}
        onClick={() => selectedTopic && onStart(selectedTopic, selectedCount)}
        className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Bắt đầu phỏng vấn
      </button>
    </div>
  );
}