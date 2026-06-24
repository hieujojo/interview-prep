"use client";

import { useState, useEffect } from "react";
import { useJDAnalysis } from "@/hooks/useJDAnalysis";
import JDAnalyzerView from "@/components/jd-analyzer/JDAnalyzerView";

export default function JDAnalyzerPage() {
  const [jdText, setJdText] = useState("");
  const { analyze, result, setResult, isAnalyzing, error, reset } = useJDAnalysis();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/jd-analysis");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.jdText) {
          setJdText(data.jdText);
          setResult(data);
        }
      } catch (e) {
        console.error("Failed to fetch latest JD analysis", e);
      }
    };
    fetchLatest();
  }, [setResult]);

  const handleChangeJdText = (text: string) => {
    setJdText(text);
    if (result) reset();
  };

  return (
    <JDAnalyzerView
      jdText={jdText}
      onChangeJdText={handleChangeJdText}
      onAnalyze={() => analyze(jdText)}
      isAnalyzing={isAnalyzing}
      error={error}
      result={result}
      isSaving={false}
      isSaved={false}
      saveError={null}
    />
  );
}