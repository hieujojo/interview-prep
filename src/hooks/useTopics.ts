"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Topic = {
  id: string;
  name: string;
  questionCount: number;
  categories: { name: string; count: number }[];
};

// topicName → Set<categoryName>  (empty Set = chọn cả topic)
export type CategorySelections = Map<string, Set<string>>;

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // NEW: category-level selection per topic
  const [categorySelections, setCategorySelections] = useState<CategorySelections>(new Map());

  useEffect(() => {
    async function fetchTopics() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("topics")
          .select(`
            id,
            name,
            categories (
              name,
              question_bank (id)
            )
          `)
          .order("display_order");

        if (fetchError) throw fetchError;

        const mapped = (data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          questionCount: t.categories?.reduce(
            (sum: number, c: { name: string; question_bank: { id: string }[] }) =>
              sum + (c.question_bank?.length ?? 0),
            0
          ) ?? 0,
          categories: t.categories?.map(
            (c: { name: string; question_bank: { id: string }[] }) => ({
              name: c.name,
              count: c.question_bank?.length ?? 0,
            })
          ) ?? [],
        }));

        setTopics(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải danh sách topic.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const toggleExpandTopic = (topicName: string) => {
    setExpandedTopic((prev) => (prev === topicName ? null : topicName));
  };

  /**
   * Toggle 1 category chip trong expanded panel.
   * - Nếu chưa có Set → tạo mới với category này
   * - Nếu đã có → add/remove category
   * - Nếu Set rỗng sau khi remove → xoá key (= bỏ chọn topic)
   */
  const toggleCategory = (topicName: string, categoryName: string) => {
    setCategorySelections((prev) => {
      const next = new Map(prev);
      const current = new Set(next.get(topicName) ?? []);

      if (current.has(categoryName)) {
        current.delete(categoryName);
      } else {
        current.add(categoryName);
      }

      if (current.size === 0) {
        next.delete(topicName);
      } else {
        next.set(topicName, current);
      }
      return next;
    });
  };

  /**
   * Tính số câu thực sự được chọn cho 1 topic,
   * dựa trên các category đang active.
   */
  const getSelectedCountForTopic = (topic: Topic): number => {
    const cats = categorySelections.get(topic.name);
    if (!cats || cats.size === 0) return 0;
    return topic.categories
      .filter((c) => cats.has(c.name))
      .reduce((sum, c) => sum + c.count, 0);
  };

  return {
    topics,
    isLoading,
    error,
    expandedTopic,
    toggleExpandTopic,
    // category selection
    categorySelections,
    toggleCategory,
    getSelectedCountForTopic,
  };
}