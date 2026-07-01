"use client";

import { useState } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";

export type EmailDraftResult = {
  subject: string;
  body: string;
  alternativeSubjects: string[];
  subjectEn: string;
  bodyEn: string;
  alternativeSubjectsEn: string[];
  tips: string[];
};

export function useEmailDraft() {
  const [draft, setDraft] = useState<EmailDraftResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const generate = async (
    jdText: string,
    options?: {
      cvText?: string;
      candidateName?: string;
      recipientName?: string;
      companyName?: string;
    }
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, provider: currentProvider, ...options }),
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

      setDraft(data as EmailDraftResult);
    } catch {
      setError("Không kết nối được tới server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => setDraft(null);

  return { generate, draft, isGenerating, error, reset };
}
