"use client";

import { useEffect, useState } from "react";
import { useUploadFile } from "@/hooks/useUploadFile";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import type { CVInterviewQuestion } from "@/hooks/useCVAnalysis";

// Hook cho trang app/profile/page.tsx — quản lý cvText + gọi phân tích CV
export function useProfilePage() {
  const [cvText, setCvText] = useState("");
  const { analyze, result, isAnalyzing, error, reset } = useCVAnalysis();

  // useCVAnalysis đã tự fetch bản phân tích gần nhất khi mount,
  // ở đây chỉ đồng bộ cvText hiển thị theo kết quả đó, KHÔNG fetch API lần 2.
  useEffect(() => {
    if (result?.cvText) {
      setCvText(result.cvText);
    }
  }, [result]);

  const handleChangeCvText = (text: string) => {
    setCvText(text);
    if (result) reset();
  };

  return {
    cvText,
    onChangeCvText: handleChangeCvText,
    onAnalyze: () => analyze(cvText),
    isAnalyzing,
    error,
    result,
  };
}

// Hook cho component ProfileView.tsx — quản lý tab, upload file, copy câu hỏi
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