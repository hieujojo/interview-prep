"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { AIReviewResult } from "@/hooks/useAIReview";
import type { InProgressNote } from '@/types/note';

export type TopicSelection = { topic: string; count: number; categories?: string[] };
export type SessionQuestion = { content: string; category: string };
export type SessionAnswer = {
  question: SessionQuestion;
  userAnswer: string;
  feedback: AIReviewResult | null;
  usedHint?: boolean;
};

type ReviewFn = (
  category: string,
  question: string,
  answer: string
) => Promise<AIReviewResult | null>;

const DIFFICULTY_ORDER = ["Cơ bản", "Trung bình", "Nâng cao"] as const;
const TIME_PER_QUESTION = 180;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

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
  if (picked.length < count) {
    const used = new Set(picked);
    const leftover = shuffle(pool.map((q) => q.content).filter((c) => !used.has(c)));
    picked.push(...leftover.slice(0, count - picked.length));
  }
  return picked;
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useInterviewSession(reviewFn: ReviewFn) {
  // ── Topic Setup ──
  const [selections, setSelections] = useState<TopicSelection[] | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, number>>({});

  const totalQuestionsSelected = Object.values(selectedTopics).reduce((a, b) => a + b, 0);

  const handleToggleTopic = (topicName: string, maxCount: number) => {
    setSelectedTopics((prev) => {
      const next = { ...prev };
      if (next[topicName]) delete next[topicName];
      else next[topicName] = Math.min(10, maxCount);
      return next;
    });
  };

  const handleUpdateCount = (topicName: string, count: number, maxCount: number) => {
    if (count <= 0) return;
    if (count > maxCount) count = maxCount;
    setSelectedTopics((prev) => ({ ...prev, [topicName]: count }));
  };

  const startSession = () => {
    const arr = Object.entries(selectedTopics).map(([topic, count]) => ({ topic, count }));
    if (arr.length > 0) setSelections(arr);
  };

  const resetSession = () => setSelections(null);

  // ── Questions ──
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);

  useEffect(() => {
    if (!selections || selections.length === 0) return;
    setIsLoadingQuestions(true);
    setLoadError(null);
    setCurrentIndex(0);

    async function fetchQuestions() {
      try {
        const allSelected: SessionQuestion[] = [];
        for (const sel of selections!) {
          if (sel.count <= 0) continue;
          let query = supabase
            .from("question_bank")
            .select("content, difficulty, categories!inner(name, topic_id, topics!inner(name))")
            .eq("categories.topics.name", sel.topic);

          if (sel.categories && sel.categories.length > 0) {
            query = query.in("categories.name", sel.categories);
          }

          const { data, error } = await query;
          if (error) throw error;
          const pool = (data ?? []).map((q: any) => ({
            content: q.content as string,
            difficulty: q.difficulty as string,
          }));
          const selectedContents = pickQuestionsByDifficulty(pool, sel.count);
          allSelected.push(...selectedContents.map((c) => ({ content: c, category: sel.topic })));
        }
        const mixed = shuffle(allSelected);
        setQuestions(mixed);
        setAnswers(mixed.map((q) => ({ question: q, userAnswer: "", feedback: null, usedHint: false })));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Lỗi tải câu hỏi.");
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selections)]);

  const currentQuestion = questions[currentIndex];
  const current = answers[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFinished = questions.length > 0 && currentIndex >= questions.length;

  const setUserAnswer = (text: string) =>
    setAnswers((prev) => prev.map((a, i) => (i === currentIndex ? { ...a, userAnswer: text } : a)));

  const setFeedback = (feedback: AIReviewResult) =>
    setAnswers((prev) => prev.map((a, i) => (i === currentIndex ? { ...a, feedback } : a)));

  // ── Timer ──
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  useEffect(() => {
    if (!selections || isFinished || !current || current.feedback || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [selections, isFinished, current?.feedback, timeLeft]);

  // ── Hint ──
  const [isHinting, setIsHinting] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  useEffect(() => {
    setCurrentHint(null);
  }, [currentIndex]);

  const markHintUsed = () =>
    setAnswers((prev) => prev.map((a, i) => (i === currentIndex ? { ...a, usedHint: true } : a)));

  const requestHint = async () => {
    if (!currentQuestion) return;
    setIsHinting(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion.content }),
      });
      const data = await res.json();
      if (data.hint) {
        setCurrentHint(data.hint);
        markHintUsed();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsHinting(false);
    }
  };

  // ── Notes ──
  const [inProgressNotes, setInProgressNotes] = useState<InProgressNote[]>([]);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);

  // Sync notes array khi questions load xong
  useEffect(() => {
    if (questions.length > 0) {
      setInProgressNotes(
        questions.map((q, idx) => ({
          questionIndex: idx,
          questionContent: q.content,
          noteText: '',
        }))
      );
    }
  }, [questions.length]);

  const updateNote = (index: number, text: string) => {
    setInProgressNotes(prev =>
      prev.map((n, i) => i === index ? { ...n, noteText: text } : n)
    );
  };

  // ── Voice ──
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const userAnswerRef = useRef(current?.userAnswer ?? "");

  useEffect(() => {
    userAnswerRef.current = current?.userAnswer ?? "";
  }, [current?.userAnswer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "vi-VN";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript && current && !current.feedback) {
        const newAns = userAnswerRef.current + (userAnswerRef.current ? " " : "") + transcript;
        setUserAnswer(newAns);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [currentIndex, current?.feedback]); // eslint-disable-line

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // ── Review & Navigation ──
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (isListening) toggleListening();
    if (!current || !currentQuestion) return;
    setIsReviewing(true);
    setReviewError(null);
    try {
      const result = await reviewFn(currentQuestion.category, currentQuestion.content, current.userAnswer);
      if (result) {
        setFeedback(result);
      } else {
        // reviewFn trả null = có lỗi, lấy error từ useAIReview
        // Nhưng hook không expose error trực tiếp, nên cần truyền error message ra
        setReviewError("Câu trả lời quá ngắn hoặc có lỗi xảy ra.");
      }
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Lỗi review.");
    } finally {
      setIsReviewing(false);
    }
  };

  useEffect(() => {
    if (timeLeft !== 0 || !current || current.feedback || isReviewing || isFinished) return;
    if (current.userAnswer.trim().length === 0) setUserAnswer("Hết giờ - Không có câu trả lời.");
    handleSubmitReview();
  }, [timeLeft]); // eslint-disable-line

  const handleNext = () => {
    if (isListening) toggleListening();
    setTimeLeft(TIME_PER_QUESTION);
    setCurrentIndex((i) => i + 1);
  };

  // ── Save Session ──
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveSession = useCallback(async () => {
    if (isSaving || isSaved) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaveError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const sessionTopic =
        selections && selections.length > 1
          ? selections.map((s) => s.topic).join(", ")
          : selections?.[0]?.topic ?? "Unknown";

      // 1. Insert session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({ type: "interview", topic: sessionTopic, user_id: user.id })
        .select()
        .single();
      if (sessionError) {
        console.error("❌ Session Insert Error:", sessionError);
        throw sessionError;
      }

      // 2. Insert tất cả answers kèm session_id
      const answersToInsert = answers.map((a) => ({
        user_id: user.id,
        session_id: sessionData.id,
        question_content: a.question.content,
        category: a.question.category,
        user_answer: a.userAnswer,
        score: a.feedback?.score ?? 0,
        feedback: a.feedback ?? null,
        used_hint: a.usedHint ?? false,
      }));

      const { error: answersError } = await supabase
        .from("answers")
        .insert(answersToInsert);

      if (answersError) {
        console.error("❌ code:", answersError.code);
        console.error("❌ message:", answersError.message);
        console.error("❌ details:", answersError.details);
        throw answersError;
      }

      setIsSaved(true);
      const notesToSave = inProgressNotes.filter(n => n.noteText.trim().length > 0);
      if (notesToSave.length > 0) {
        const notesPayload = notesToSave.map(n => ({
          user_id: user.id,
          session_id: sessionData.id,
          question_index: n.questionIndex,
          question_content: n.questionContent,
          note_text: n.noteText,
        }));

        const { error: notesError } = await supabase
          .from("session_notes")
          .insert(notesPayload);

        if (notesError) {
          console.error("❌ Notes Insert Error:", notesError);
          // Không throw — lỗi notes không nên block toàn bộ save
        }
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Lưu phiên phỏng vấn thất bại.");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, isSaved, selections, answers]);

  useEffect(() => {
    if (isFinished) saveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  return {
    // setup
    selections,
    setSelections,
    selectedTopics,
    totalQuestionsSelected,
    handleToggleTopic,
    handleUpdateCount,
    startSession,
    resetSession,
    // questions
    questions,
    isLoadingQuestions,
    loadError,
    currentIndex,
    currentQuestion,
    current,
    isLastQuestion,
    isFinished,
    answers,
    setUserAnswer,
    // timer
    timeLeft,
    // hint
    isHinting,
    currentHint,
    requestHint,
    // notes — thêm 2 dòng này
    inProgressNotes,
    updateNote,
    isNoteDrawerOpen,
    setIsNoteDrawerOpen,
    // voice
    isListening,
    toggleListening,
    // review
    isReviewing,
    reviewError,
    handleSubmitReview,
    handleNext,
    // save
    isSaving,
    saveError,
    isSaved,
  };
}