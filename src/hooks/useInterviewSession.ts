"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { getRandomQuestions } from "@/static/interview-questions";
import type { AIReviewResult } from "@/hooks/useAIReview";

export type SessionAnswer = {
  question: string;
  userAnswer: string;
  feedback: AIReviewResult | null;
};

export function useInterviewSession(topic: string, count: number) {
  // =========================
  // Interview Session Logic
  // =========================
  const questions = useMemo(
    () => getRandomQuestions(topic, count),
    [topic, count]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<SessionAnswer[]>(
    questions.map((q) => ({
      question: q,
      userAnswer: "",
      feedback: null,
    }))
  );

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFinished = currentIndex >= questions.length;

  const setUserAnswer = (text: string) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === currentIndex
          ? {
              ...a,
              userAnswer: text,
            }
          : a
      )
    );
  };

  const setFeedback = (feedback: AIReviewResult) => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === currentIndex
          ? {
              ...a,
              feedback,
            }
          : a
      )
    );
  };

  const goNext = () => {
    setCurrentIndex((i) => i + 1);
  };

  // =========================
  // Save Session Logic
  // =========================
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveSession = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // 1. Tạo session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          type: "interview",
          topic,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const sessionId = sessionData.id;

      // 2. Lưu questions + answers
      for (const answer of answers) {
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .insert({
            session_id: sessionId,
            content: answer.question,
            category: topic,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        const feedbackText = answer.feedback
          ? `Điểm mạnh: ${answer.feedback.strengths}

Thiếu sót: ${answer.feedback.gaps}

Cải thiện: ${answer.feedback.improvements}`
          : null;

        const { error: answerError } = await supabase
          .from("answers")
          .insert({
            question_id: questionData.id,
            user_answer: answer.userAnswer,
            ai_feedback: feedbackText,
            score: answer.feedback?.score ?? null,
          });

        if (answerError) throw answerError;
      }

      setIsSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Lưu phiên phỏng vấn thất bại."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Session
    questions,
    currentIndex,
    currentQuestion,
    isLastQuestion,
    isFinished,
    answers,
    setUserAnswer,
    setFeedback,
    goNext,

    // Save
    saveSession,
    isSaving,
    saveError,
    isSaved,
  };
}