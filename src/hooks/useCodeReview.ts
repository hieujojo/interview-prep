"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type CodeReviewResult = {
  syntaxErrors: string;
  logicErrors: string;
  edgeCases: string;
  performance: string;
  bestPractices: string;
  security: string;
  improvedCode: string;
};

export function useCodeReview() {
  // =========================
  // Review State
  // =========================

  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (
    language: string,
    context: string,
    code: string
  ) => {
    setIsReviewing(true);
    setError(null);

    try {
      const res = await fetch("/api/code-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          context,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return null;
      }

      const reviewResult = data as CodeReviewResult;
      setResult(reviewResult);

      return reviewResult;
    } catch {
      setError("Không kết nối được tới server.");
      return null;
    } finally {
      setIsReviewing(false);
    }
  };

  const reset = () => {
    setResult(null);
  };

  // =========================
  // Save State
  // =========================

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveReview = async (
    language: string,
    code: string,
    reviewResult: CodeReviewResult
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          type: "code_review",
          topic: language,
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      const { error: reviewError } = await supabase
        .from("code_reviews")
        .insert({
          session_id: sessionData.id,
          language,
          code_input: code,
          ai_review: JSON.stringify(reviewResult),
        });

      if (reviewError) {
        throw reviewError;
      }

      setIsSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Lưu kết quả review thất bại."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetSaveState = () => {
    setIsSaved(false);
    setSaveError(null);
  };

  return {
    review,
    result,
    isReviewing,
    error,
    reset,

    saveReview,
    isSaving,
    saveError,
    isSaved,
    resetSaveState,
  };
}