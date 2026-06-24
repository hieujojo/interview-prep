"use client";

import { useState, useEffect } from "react";

const LS_RESULT = "jd_last_result";
const LS_TEXT   = "jd_last_text";

export type JDQuestion = {
  category: "Technical" | "System Design" | "Behavioral";
  difficulty: "Cơ bản" | "Trung bình" | "Nâng cao";
  content: string;
};

export type JDExercise = {
  title: string;
  description: string;
  language: string;
};

export type CompanyAnalysis = {
  culture: string;
  environment: string;
  techMaturity: "Startup" | "Scale-up" | "Enterprise";
  workStyle: string;
  pros: string[];
  cons: string[];
};

export type SalaryRange = {
  min: number;
  max: number;
  currency: string;
  note: string;
};

export type LearningRoadmapItem = {
  priority: "Cao" | "Trung bình" | "Thấp";
  skill: string;
  reason: string;
};

export type JDAnalysisResult = {
  techStack: string[];
  level: "Junior" | "Mid" | "Senior";
  levelReason: string;
  focusSkills: string[];
  companyName: string | null;
  companyAnalysis: CompanyAnalysis | null;
  salaryRange: SalaryRange | null;
  learningRoadmap: LearningRoadmapItem[];
  questions: JDQuestion[];
  exercises: JDExercise[];
  savedId?: string | null;
};

export function useJDAnalysis() {
  const [result, setResult] = useState<JDAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (jdText: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/jd-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return;
      }

      setResult(data as JDAnalysisResult);
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
  };

  return { analyze, result, setResult, isAnalyzing, error, reset };
}