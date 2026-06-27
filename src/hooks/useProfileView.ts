"use client";

import { useState } from "react";
import { useUploadFile } from "@/hooks/useUploadFile";
import type { CVInterviewQuestion } from "@/hooks/useCVAnalysis";

export function useProfileView(onChangeCvText: (text: string) => void) {
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "learning">("overview");
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);

  const { isUploading, fileInputRef, uploadFile, triggerUpload } = useUploadFile();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, onChangeCvText, (err) => alert(err));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadFile(file, onChangeCvText, (err) => alert(err));
  };

  const copyQuestion = (q: CVInterviewQuestion, idx: number) => {
    navigator.clipboard.writeText(q.content);
    setCopiedQuestion(idx);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  return {
    activeTab,
    setActiveTab,
    isUploading,
    fileInputRef,
    triggerUpload,
    handleFileUpload,
    handleDrop,
    copiedQuestion,
    copyQuestion,
  };
}