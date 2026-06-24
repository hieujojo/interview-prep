"use client";

import { useState, useEffect } from "react";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const [cvText, setCvText] = useState("");
  const { analyze, result, setResult, isAnalyzing, error, reset } = useCVAnalysis();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/cv-analysis");
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.cvText) {
          setCvText(data.cvText);
          setResult(data);
        }
      } catch (e) {
        console.error("Failed to fetch latest CV analysis", e);
      }
    };
    fetchLatest();
  }, [setResult]);

  const handleChangeCvText = (text: string) => {
    setCvText(text);
    if (result) reset();
  };

  return (
    <ProfileView
      cvText={cvText}
      onChangeCvText={handleChangeCvText}
      onAnalyze={() => analyze(cvText)}
      isAnalyzing={isAnalyzing}
      error={error}
      result={result}
    />
  );
}
