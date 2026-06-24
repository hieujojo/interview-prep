"use client";

import { useState } from "react";

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
        body: JSON.stringify({ jdText, ...options }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra.");
        return;
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
