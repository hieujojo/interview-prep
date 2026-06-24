"use client";

import { useState } from "react";

export type MatchedSkill = {
  skill: string;
  level: string;
  required: string;
};

export type MissingSkill = {
  skill: string;
  importance: "Bắt buộc" | "Quan trọng" | "Tốt nếu có";
  description: string;
};

export type MatchSuggestion = {
  area: string;
  action: string;
  timeline: string;
  priority: "Cao" | "Trung bình" | "Thấp";
};

export type LearningPathItem = {
  skill: string;
  why: string;
  howToLearn: string;
  estimatedTime: string;
};

export type InterviewReadiness = {
  score: number;
  strongPoints: string[];
  weakPoints: string[];
  tips: string[];
};

export type CVJDMatchResult = {
  matchScore: number;
  verdict: string;
  verdictReason: string;
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  surplusSkills: string[];
  experienceMatch: {
    required: string;
    candidate: string;
    gap: string | null;
  };
  suggestions: MatchSuggestion[];
  learningPath: LearningPathItem[];
  interviewReadiness: InterviewReadiness;
  coverLetterHints: string[];
};

export function useCVJDMatch() {
  const [result, setResult] = useState<CVJDMatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = async (cvText: string, jdText: string) => {
    setIsMatching(true);
    setError(null);

    try {
      const res = await fetch("/api/cv-jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jdText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return;
      }

      setResult(data as CVJDMatchResult);
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsMatching(false);
    }
  };

  const reset = () => setResult(null);

  return { match, result, isMatching, error, reset };
}
