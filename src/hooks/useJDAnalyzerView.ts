"use client";

import { useState, useEffect } from "react";
import { useUploadFile } from "@/hooks/useUploadFile";
import { useCVJDMatch } from "@/hooks/useCVJDMatch";
import { useEmailDraft } from "@/hooks/useEmailDraft";
import { useAIProviderStore } from "@/stores/aiProviderStore";

// ── Types ──────────────────────────────────────────────────────────────────
export type JDQuestion = {
  category: "Technical" | "System Design" | "Behavioral";
  difficulty: "Cơ bản" | "Trung bình" | "Nâng cao";
  content: string;
};

export type JDExercise = {
  title: string;
  description: string;
  language: string;
};

export type CompanyAnalysis = {
  culture: string;
  environment: string;
  techMaturity: "Startup" | "Scale-up" | "Enterprise";
  workStyle: string;
  pros: string[];
  cons: string[];
};

export type SalaryRange = {
  min: number;
  max: number;
  currency: string;
  note: string;
};

export type LearningRoadmapItem = {
  priority: "Cao" | "Trung bình" | "Thấp";
  skill: string;
  reason: string;
};

export type JDAnalysisResult = {
  techStack: string[];
  level: "Junior" | "Mid" | "Senior";
  levelReason: string;
  focusSkills: string[];
  companyName: string | null;
  companyAnalysis: CompanyAnalysis | null;
  salaryRange: SalaryRange | null;
  learningRoadmap: LearningRoadmapItem[];
  questions: JDQuestion[];
  exercises: JDExercise[];
  savedId?: string | null;
};

// ── Hook ───────────────────────────────────────────────────────────────────
export function useJDAnalyzerView(
  onChangeJdText?: (text: string) => void,
  jdTextProp?: string
) {
  const [jdText, setJdText] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "company" | "roadmap">("questions");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [matchCvText, setMatchCvText] = useState("");
  const hasSavedCV = matchCvText.trim().length > 0;
  const [result, setResult] = useState<JDAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { currentProvider, setFallbackActive, setAIDisabled } = useAIProviderStore();

  const {
    match, result: matchResult, isMatching, error: matchError, reset: resetMatch,
  } = useCVJDMatch();

  const {
    generate, draft, isGenerating, error: emailError, reset: resetEmail,
  } = useEmailDraft();

  const {
    isUploading, fileInputRef, uploadFile: uploadJD, triggerUpload: triggerJDUpload,
  } = useUploadFile();

  const {
    fileInputRef: cvFileRef, uploadFile: uploadCV, triggerUpload: triggerCVUpload,
  } = useUploadFile();

  // Fetch latest JD analysis on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/jd-analysis");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.jdText) {
          setJdText(data.jdText);
          setResult(data);
        }
      } catch (e) {
        console.error("Failed to fetch latest JD analysis", e);
      }
    };
    fetchLatest();
  }, []);

  // Check saved CV on mount
  useEffect(() => {
    const checkSavedCV = async () => {
      try {
        const res = await fetch("/api/cv-analysis");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.cvText) {
          setMatchCvText(data.cvText);
        }
      } catch (e) {
        console.error("Failed to check saved CV", e);
      }
    };
    checkSavedCV();
  }, []);

  const handleChangeJdText = (text: string) => {
    setJdText(text);
    if (result) {
      setResult(null);
      setError(null);
    }
  };

  const analyze = async () => {
    if (jdText.trim().length < 50) return;
    setIsAnalyzing(true);
    setError(null);
    setUploadError(null);
    try {
      const res = await fetch("/api/jd-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, provider: currentProvider, targetPosition }),
      });
      const data = await res.json();
      
      if (res.status === 503 && data.error === "AI_DISABLED") {
        setAIDisabled(true);
        setError("Hệ thống AI hiện đang quá tải hoặc bảo trì. Vui lòng thử lại sau.");
        return;
      }
      
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }

      if (data._meta?.didFallback) {
        setFallbackActive(true);
      } else {
        setFallbackActive(false);
      }
      
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "Có lỗi xảy ra");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    uploadJD(file, handleChangeJdText, (err) => setUploadError(err));
  };

  const handleCvUploadForMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadCV(file, setMatchCvText, (err) => setUploadError(err));
  };

  const openMatchModal = () => {
    resetMatch();
    setShowMatchModal(true);
  };

  const closeMatchModal = () => {
    setShowMatchModal(false);
    resetMatch();
  };

  const handleMatch = () => {
    if (matchCvText && jdText) match(matchCvText, jdText);
  };

  const openEmailModal = () => {
    resetEmail();
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    resetEmail();
  };

  return {
    jdText,
    handleChangeJdText,
    targetPosition,
    setTargetPosition,
    analyze,
    result,
    setResult,
    isAnalyzing,
    error,
    isSaving,
    isSaved,
    saveError,
    activeTab,
    setActiveTab,
    isUploading,
    fileInputRef,
    triggerJDUpload,
    handleFileUpload,
    cvFileRef,
    triggerCVUpload,
    handleCvUploadForMatch,
    matchCvText,
    setMatchCvText,
    hasSavedCV,
    matchResult,
    isMatching,
    matchError,
    showMatchModal,
    openMatchModal,
    closeMatchModal,
    handleMatch,
    showEmailModal,
    draft,
    isGenerating,
    emailError,
    generate,
    openEmailModal,
    closeEmailModal,
    uploadError,
    setUploadError
  };
}