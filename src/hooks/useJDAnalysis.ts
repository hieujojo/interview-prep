"use client";

import { useState } from "react";

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

export type JDAnalysisResult = {
  techStack: string[];
  level: "Junior" | "Mid" | "Senior";
  levelReason: string;
  focusSkills: string[];
  questions: JDQuestion[];
  exercises: JDExercise[];
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

  const reset = () => setResult(null);

  return { analyze, result, isAnalyzing, error, reset };
}