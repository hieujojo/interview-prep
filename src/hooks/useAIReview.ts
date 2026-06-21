"use client";

import { useState } from "react";

export type AIReviewResult = {
  strengths: string;
  gaps: string;
  improvements: string;
  score: number;
};

export function useAIReview() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (
    topic: string,
    question: string,
    userAnswer: string
  ): Promise<AIReviewResult | null> => {
    setIsReviewing(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, question, userAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return null;
      }

      return data as AIReviewResult;
    } catch {
      setError("Không kết nối được tới server.");
      return null;
    } finally {
      setIsReviewing(false);
    }
  };

  return { review, isReviewing, error };
}