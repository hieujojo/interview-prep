"use client";

import { useState } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";

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

export type CVPassAnalysis = {
  passChance: number;
  passLabel: "Khó pass" | "Có thể pass" | "Khả năng cao" | "Rất cao";
  roleContext: string;
  recruiterFirstImpression: string;
  whyHireThis: string | null;
  whyReject: string;
  competitorComparison: string;
  cvWeaknesses: string[];
  cvStrengths: string[];
  marketContext: string;
  stackFitForMarket: string;
  atsRisk: string;
  improvementToPassSooner: string;
  companyTypeAnalysis: string;
  salaryExpectationFit?: string;
};

export type CVJDMatchResult = {
  // --- Role & Market Detection ---
  detectedRole: "Intern" | "Fresher" | "Junior";
  detectedMarket: string;

  // --- Core Match ---
  matchScore: number;
  verdict: "Phù hợp tốt" | "Phù hợp một phần" | "Chưa phù hợp";
  verdictReason: string;

  // --- Skills ---
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  surplusSkills: string[];

  // --- Experience ---
  experienceMatch: {
    required: string;
    candidate: string;
    gap: string | null;
  };

  // --- Pass Analysis ---
  cvPassAnalysis: CVPassAnalysis;

  // --- Action Items ---
  suggestions: MatchSuggestion[];
  learningPath: LearningPathItem[];

  // --- Interview ---
  interviewReadiness: InterviewReadiness;
  coverLetterHints: string[];
};

export function useCVJDMatch() {
  const [result, setResult] = useState<CVJDMatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const match = async (cvText: string, jdText: string, targetPosition?: string) => {
    setIsMatching(true);
    setError(null);

    try {
      const res = await fetch("/api/cv-jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jdText, provider: currentProvider, targetPosition }),
      });

      const data = await res.json();

      if (res.status === 503 && data.error === "AI_DISABLED") {
        setAIDisabled(true);
        setError("Hệ thống AI hiện đang quá tải hoặc bảo trì. Vui lòng thử lại sau.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return;
      }

      if (data._meta?.didFallback) {
        setFallbackActive(true);
      } else {
        setFallbackActive(false);
      }

      setResult(data as CVJDMatchResult);
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsMatching(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { match, result, isMatching, error, reset };
}