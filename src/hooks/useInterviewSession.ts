"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { AIReviewResult } from "@/hooks/useAIReview";

export type SessionAnswer = {
  question: string;
  userAnswer: string;
  feedback: AIReviewResult | null;
};

const DIFFICULTY_ORDER = ["Cơ bản", "Trung bình", "Nâng cao"] as const;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Chọn ngẫu nhiên trong từng mức độ khó, chia đều theo tỉ lệ, nối theo thứ tự dễ -> khó
function pickQuestionsByDifficulty(
  pool: { content: string; difficulty: string }[],
  count: number
): string[] {
  const grouped: Record<string, string[]> = { "Cơ bản": [], "Trung bình": [], "Nâng cao": [] };
  for (const q of pool) {
    if (grouped[q.difficulty]) grouped[q.difficulty].push(q.content);
  }

  const perLevel = Math.floor(count / DIFFICULTY_ORDER.length);
  let remainder = count - perLevel * DIFFICULTY_ORDER.length;

  const picked: string[] = [];
  for (const level of DIFFICULTY_ORDER) {
    const take = perLevel + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    picked.push(...shuffle(grouped[level]).slice(0, take));
  }

  // Nếu thiếu (1 mức không đủ câu), bù thêm từ các câu còn dư của mức khác
  if (picked.length < count) {
    const used = new Set(picked);
    const leftover = shuffle(pool.map((q) => q.content).filter((c) => !used.has(c)));
    picked.push(...leftover.slice(0, count - picked.length));
  }

  return picked;
}

export function useInterviewSession(topic: string, count: number) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoadingQuestions(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase
          .from("question_bank")
          .select("content, difficulty, categories!inner(topic_id, topics!inner(name))")
          .eq("categories.topics.name", topic);

        if (error) throw error;

        const pool = (data ?? []).map((q) => ({
          content: q.content as string,
          difficulty: q.difficulty as string,
        }));

        const selected = pickQuestionsByDifficulty(pool, count);

        setQuestions(selected);
        setAnswers(
          selected.map((q) => ({ question: q, userAnswer: "", feedback: null }))
        );
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Lỗi tải câu hỏi.");
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, [topic, count]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFinished = questions.length > 0 && currentIndex >= questions.length;

  const setUserAnswer = (text: string) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, userAnswer: text } : a))
    );
  };

  const setFeedback = (feedback: AIReviewResult) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, feedback } : a))
    );
  };

  const goNext = () => setCurrentIndex((i) => i + 1);

  // Save session logic (giữ nguyên như cũ)
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveSession = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({ type: "interview", topic })
        .select()
        .single();

      if (sessionError) throw sessionError;
      const sessionId = sessionData.id;

      for (const answer of answers) {
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .insert({ session_id: sessionId, content: answer.question, category: topic })
          .select()
          .single();

        if (questionError) throw questionError;

        const feedbackText = answer.feedback
          ? `Điểm mạnh: ${answer.feedback.strengths}\n\nThiếu sót: ${answer.feedback.gaps}\n\nCải thiện: ${answer.feedback.improvements}`
          : null;

        const { error: answerError } = await supabase.from("answers").insert({
          question_id: questionData.id,
          user_answer: answer.userAnswer,
          ai_feedback: feedbackText,
          score: answer.feedback?.score ?? null,
        });

        if (answerError) throw answerError;
      }

      setIsSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Lưu phiên phỏng vấn thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    questions,
    isLoadingQuestions,
    loadError,
    currentIndex,
    currentQuestion,
    isLastQuestion,
    isFinished,
    answers,
    setUserAnswer,
    setFeedback,
    goNext,
    saveSession,
    isSaving,
    saveError,
    isSaved,
  };
}