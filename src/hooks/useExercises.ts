"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAIProviderStore } from "@/stores/aiProviderStore";

// ── Types ──
export type Difficulty = "beginner" | "junior" | "mid" | "senior" | "expert";

export type Topic = {
  id: string;
  name: string;
  display_order: number;
};

export type Exercise = {
  id: string;
  topic_id: string;
  title: string;
  difficulty: Difficulty;
  suggested_language: string | null;
  description: string;
  example: string | null;
  hint: string | null;
  display_order: number;
  topics?: { name: string } | null; // join từ bảng topics
};

export type ExerciseReviewResult = {
  syntaxErrors: string;
  logicErrors: string;
  edgeCases: string;
  performance: string;
  bestPractices: string;
  security: string;
  improvedCode: string;
};

type UseExercisesOptions = {
  topicId?: string | null;
  difficulty?: string | null;
};

export function useExercises(options?: UseExercisesOptions) {
  // ─────────────────────────────
  // Topics (dùng cho filter pill)
  // ─────────────────────────────
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      setIsLoadingTopics(true);
      const { data } = await supabase
        .from("topics")
        .select("id, name, display_order")
        .order("display_order", { ascending: true });
      setTopics(data ?? []);
      setIsLoadingTopics(false);
    }
    fetchTopics();
  }, []);

  // ─────────────────────────────
  // Exercises catalog
  // ─────────────────────────────
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setIsLoadingExercises(true);
    setExercisesError(null);

    try {
      const params = new URLSearchParams();
      if (options?.topicId) params.set("topic_id", options.topicId);
      if (options?.difficulty) params.set("difficulty", options.difficulty);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Không tải được danh sách bài tập.");
      setExercises(data.exercises ?? []);
    } catch (err) {
      setExercisesError(err instanceof Error ? err.message : "Lỗi tải bài tập.");
    } finally {
      setIsLoadingExercises(false);
    }
  }, [options?.topicId, options?.difficulty]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // ─────────────────────────────
  // AI Review + lưu submission
  // ─────────────────────────────
  const [result, setResult] = useState<ExerciseReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  // exerciseId = null nếu user tự viết code tự do, không chọn bài tập cụ thể
  const review = async (
    language: string,
    context: string,
    code: string,
    exerciseId: string | null = null
  ) => {
    setIsReviewing(true);
    setReviewError(null);
    setSaveWarning(null);

    try {
      const res = await fetch("/api/exercises/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          context,
          code,
          provider: currentProvider,
          exerciseId,
        }),
      });

      const data = await res.json();

      if (res.status === 503 && data.error === "AI_DISABLED") {
        setAIDisabled(true);
        setReviewError("Hệ thống AI hiện đang quá tải hoặc bảo trì. Vui lòng thử lại sau.");
        return null;
      }

      if (!res.ok) {
        setReviewError(data.error ?? "Có lỗi xảy ra.");
        return null;
      }

      setFallbackActive(!!data._meta?.didFallback);
      if (data._meta?.saveWarning) setSaveWarning(data._meta.saveWarning);

      const reviewResult = data as ExerciseReviewResult;
      setResult(reviewResult);
      return reviewResult;
    } catch {
      setReviewError("Không kết nối được tới server.");
      return null;
    } finally {
      setIsReviewing(false);
    }
  };

  const resetReview = () => {
    setResult(null);
    setSaveWarning(null);
    setReviewError(null);
  };

  return {
    // topics (filter)
    topics,
    isLoadingTopics,

    // exercises catalog
    exercises,
    isLoadingExercises,
    exercisesError,
    isExercisesEmpty: !isLoadingExercises && exercises.length === 0 && !exercisesError,
    refetchExercises: fetchExercises,

    // AI review
    review,
    result,
    isReviewing,
    reviewError,
    saveWarning,
    resetReview,
  };
}