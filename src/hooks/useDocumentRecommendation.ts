"use client";

import { useState } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";

export type RecommendedDocument = {
  id: string;
  title: string;
  file_type: string;
  difficulty: string | null;
  topics: { name: string } | null;
  categories: { name: string } | null;
  reason: string;
};

export type RecommendationResult = {
  weaknesses: string[];
  recommendations: RecommendedDocument[];
};

export function useDocumentRecommendation() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/document-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: currentProvider }),
      });

      const data = await res.json();

      if (res.status === 503 && data.error === "AI_DISABLED") {
        setAIDisabled(true);
        setError("Hệ thống AI hiện đang quá tải. Vui lòng thử lại sau.");
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

      setResult({
        weaknesses: data.weaknesses ?? [],
        recommendations: data.recommendations ?? [],
      });
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { getRecommendations, result, isLoading, error, reset };
}
