"use client";

import { useState } from "react";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const [cvText, setCvText] = useState("");
  const { analyze, result, isAnalyzing, error, reset } = useCVAnalysis();

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
