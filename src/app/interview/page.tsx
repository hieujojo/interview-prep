"use client";

import { useState, useEffect } from "react";
import TopicSelector from "@/components/interview/TopicSelector";
import QuestionCard from "@/components/interview/QuestionCard";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useAIReview } from "@/hooks/useAIReview";

export default function InterviewPage() {
  const [session, setSession] = useState<{
    topic: string;
    count: number;
  } | null>(null);

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">
          Phỏng vấn AI theo Topic
        </h1>

        <TopicSelector
          onStart={(topic, count) =>
            setSession({ topic, count })
          }
        />
      </div>
    );
  }

  return (
    <InterviewRunner
      topic={session.topic}
      count={session.count}
    />
  );
}

function InterviewRunner({
  topic,
  count,
}: {
  topic: string;
  count: number;
}) {
  const {
    questions,
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
    isSaved,
    saveError,
  } = useInterviewSession(topic, count);

  const { review, isReviewing, error } = useAIReview();

  const handleSubmitReview = async () => {
    const current = answers[currentIndex];

    const result = await review(
      topic,
      currentQuestion,
      current.userAnswer
    );

    if (result) {
      setFeedback(result);
    }
  };

  useEffect(() => {
    if (isFinished && !isSaved && !isSaving) {
      saveSession();
    }
  }, [
    isFinished,
    isSaved,
    isSaving,
    saveSession,
  ]);

  if (isFinished) {
    const avgScore =
      answers.reduce(
        (sum, a) => sum + (a.feedback?.score ?? 0),
        0
      ) / answers.length;

    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Đã hoàn thành buổi phỏng vấn topic {topic}!
        </h1>

        <p>
          Điểm trung bình: {avgScore.toFixed(1)}/10
        </p>

        {isSaving && (
          <p className="text-gray-500 text-sm">
            Đang lưu vào lịch sử...
          </p>
        )}

        {isSaved && (
          <p className="text-green-600 text-sm">
            ✅ Đã lưu vào lịch sử.
          </p>
        )}

        {saveError && (
          <p className="text-red-500 text-sm">
            Lỗi lưu: {saveError}
          </p>
        )}
      </div>
    );
  }

  const current = answers[currentIndex];

  return (
    <QuestionCard
      question={currentQuestion}
      index={currentIndex}
      total={questions.length}
      userAnswer={current.userAnswer}
      onChangeAnswer={setUserAnswer}
      onSubmitReview={handleSubmitReview}
      isReviewing={isReviewing}
      reviewError={error}
      feedback={current.feedback}
      isLastQuestion={isLastQuestion}
      onNext={goNext}
    />
  );
}