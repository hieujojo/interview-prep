"use client";

import { useState } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";

export type AIReviewResult = {
  strengths: string;
  gaps: string;
  improvements: string;
  example: string;
  score: number;
  categoryScores?: {
    technical: number;
    problemSolving: number;
    communication: number;
    bestPractices: number;
  };
};

export function useAIReview() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const review = async (
    topic: string,
    question: string,
    userAnswer: string
  ): Promise<AIReviewResult | null> => {
    setIsReviewing(true);
    setError(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, question, userAnswer, provider: currentProvider }),
      });

      const data = await res.json();

      if (res.status === 503 && data.error === "AI_DISABLED") {
        setAIDisabled(true);
        throw new Error("Hệ thống AI hiện đang bảo trì, vui lòng thử lại sau.");
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Có lỗi xảy ra.");
      }

      if (data._meta?.didFallback) {
        setFallbackActive(true);
      } else {
        setFallbackActive(false);
      }

      return data as AIReviewResult;
    } catch (err: any) {
      setError(err.message || "Không kết nối được tới server.");
      return null;
    } finally {
      setIsReviewing(false);
    }
  };

  return { review, isReviewing, error };
} 