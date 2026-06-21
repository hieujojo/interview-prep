"use client";

import { useState } from "react";
import { useJDAnalysis } from "@/hooks/useJDAnalysis";
import JDAnalyzerView from "@/components/jd-analyzer/JDAnalyzerView";

export default function JDAnalyzerPage() {
  const [jdText, setJdText] = useState("");
  const { analyze, result, isAnalyzing, error, reset } = useJDAnalysis();

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
    />
  );
}