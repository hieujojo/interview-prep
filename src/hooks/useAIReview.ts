"use client";

import { useState } from "react";

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
        body: JSON.stringify({ topic, question, userAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Có lỗi xảy ra.");
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