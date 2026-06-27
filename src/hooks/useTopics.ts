"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Topic = {
  id: string;
  name: string;
  questionCount: number;
  categories: { name: string; count: number }[];
};

export type CategorySelections = Map<string, Set<string>>;
export type Mode = "quick" | "custom";

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [categorySelections, setCategorySelections] = useState<CategorySelections>(new Map());
  const [topicCounts, setTopicCounts] = useState<Map<string, number>>(new Map());
  const [mode, setMode] = useState<Mode>("quick");

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

  /**
   * Chỉ expand topic vào panel category, không toggle.
   * Gọi khi user click chọn topic mới trong custom mode.
   */
  const expandTopic = (topicName: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.add(topicName);
      return next;
    });
  };

  /**
   * Collapse (ẩn) topic khỏi panel category.
   * Gọi khi user bấm nút X trong panel hoặc bỏ chọn topic.
   */
  const collapseTopic = (topicName: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.delete(topicName);
      return next;
    });
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

  const clearCategorySelection = (topicName: string) => {
    setCategorySelections((prev) => {
      const next = new Map(prev);
      next.delete(topicName);
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

  const setCountForTopic = (topicName: string, count: number) => {
    setTopicCounts((prev) => new Map(prev).set(topicName, count));
  };

  const getMaxForTopic = (topic: Topic): number => {
    const cats = categorySelections.get(topic.name);
    const result = !cats || cats.size === 0
      ? topic.questionCount
      : topic.categories.filter((c) => cats.has(c.name)).reduce((sum, c) => sum + c.count, 0);

    return result;
  };

  const getCountForTopic = (topicName: string, max: number): number => {
    const result = topicCounts.get(topicName) ?? Math.min(10, max);
    return result;
  };

  return {
    topics,
    isLoading,
    error,
    mode,
    setMode,
    expandedTopics,
    expandTopic,
    collapseTopic,
    // category selection
    categorySelections,
    toggleCategory,
    getSelectedCountForTopic,
    topicCounts,
    setCountForTopic,
    getMaxForTopic,
    getCountForTopic,
    clearCategorySelection
  };
} 