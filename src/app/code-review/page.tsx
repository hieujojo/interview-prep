"use client";

import { useState, useEffect } from "react";
import { useCodeReview } from "@/hooks/useCodeReview";
import CodeReviewView from "@/components/code-review/CodeReviewView";

export default function CodeReviewPage() {
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [code, setCode] = useState("");

  const { review, result, isReviewing, error, reset , saveReview, isSaving, saveError, isSaved, resetSaveState } = useCodeReview();

  useEffect(() => {
    if (result && !isSaved && !isSaving) {
      saveReview(language, code, result);
    }
  }, [code, isSaved, isSaving, language, result, saveReview]);

  const handleChangeCode = (value: string) => {
    setCode(value);
    if (result) {
      reset();
      resetSaveState();
    }
  };

  return (
    <CodeReviewView
      language={language}
      onChangeLanguage={setLanguage}
      context={context}
      onChangeContext={setContext}
      code={code}
      onChangeCode={handleChangeCode}
      onReview={() => review(language, context, code)}
      isReviewing={isReviewing}
      error={error}
      result={result}
      isSaving={isSaving}
      isSaved={isSaved}
      saveError={saveError}
    />
  );
}