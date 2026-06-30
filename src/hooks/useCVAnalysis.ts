"use client";

import { useState, useEffect } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";

export type CVSkills = {
  technical: string[];
  soft: string[];
  tools: string[];
};

export type CVExperience = {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
};

export type CVProject = {
  name: string;
  tech: string[];
  description: string;
  impact: string;
};

export type CVEducation = {
  degree: string;
  major: string;
  school: string;
  year: string;
};

export type CVStrength = {
  title: string;
  description: string;
};

export type CVWeakness = {
  title: string;
  description: string;
};

export type CVLearningRecommendation = {
  skill: string;
  reason: string;
  priority: "Cao" | "Trung bình" | "Thấp";
  resources: string[];
};

export type CVInterviewQuestion = {
  category: "Skill" | "Project" | "Experience" | "Behavioral";
  difficulty: "Cơ bản" | "Trung bình" | "Nâng cao";
  content: string;
  context: string;
};

export type CVOverallScore = {
  score: number;
  breakdown: {
    technicalDepth: number;
    projectImpact: number;
    experience: number;
    presentation: number;
  };
  summary: string;
};

export type CVAnalysisResult = {
  name: string | null;
  currentLevel: "Junior" | "Mid" | "Senior";
  levelReason: string;
  skills: CVSkills;
  experience: CVExperience[];
  projects: CVProject[];
  education: CVEducation | null;
  strengths: CVStrength[];
  weaknesses: CVWeakness[];
  learningRecommendations: CVLearningRecommendation[];
  interviewQuestions: CVInterviewQuestion[];
  overallScore: CVOverallScore;
};

export function useCVAnalysis() {
  const [result, setResult] = useState<CVAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const analyze = async (cvText: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/cv-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, provider: currentProvider }),
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

      setResult(data as CVAnalysisResult);
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => setResult(null);

  return { analyze, result, setResult, isAnalyzing, error, reset };
}
