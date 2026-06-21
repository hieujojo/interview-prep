"use client";

import type { AIReviewResult } from "@/hooks/useAIReview";

type QuestionCardProps = {
  question: string;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (text: string) => void;
  onSubmitReview: () => void;
  isReviewing: boolean;
  reviewError: string | null;
  feedback: AIReviewResult | null;
  isLastQuestion: boolean;
  onNext: () => void;
};

export default function QuestionCard({
  question,
  index,
  total,
  userAnswer,
  onChangeAnswer,
  onSubmitReview,
  isReviewing,
  reviewError,
  feedback,
  isLastQuestion,
  onNext,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Câu {index + 1} / {total}
      </p>

      <h2 className="text-lg font-semibold text-foreground">{question}</h2>

      <textarea
        value={userAnswer}
        onChange={(e) => onChangeAnswer(e.target.value)}
        disabled={!!feedback}
        rows={8}
        placeholder="Viết câu trả lời của bạn ở đây..."
        className="w-full bg-surface border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary disabled:opacity-60"
      />

      {reviewError && <p className="text-danger text-sm">{reviewError}</p>}

      {!feedback && (
        <button
          onClick={onSubmitReview}
          disabled={!userAnswer.trim() || isReviewing}
          className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-30"
        >
          {isReviewing ? "Đang phân tích..." : "AI Review"}
        </button>
      )}

      {feedback && (
        <div className="border border-border rounded-md p-4 bg-surface space-y-3">
          <p className="font-semibold text-foreground">Điểm: {feedback.score}/10</p>

          <div>
            <p className="text-sm font-medium text-success">✅ Điểm mạnh</p>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{feedback.strengths}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-warning">⚠️ Thiếu sót</p>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{feedback.gaps}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-info">💡 Cải thiện</p>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{feedback.improvements}</p>
          </div>

          <button
            onClick={onNext}
            className="mt-3 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            {isLastQuestion ? "Kết thúc buổi" : "Câu tiếp theo"}
          </button>
        </div>
      )}
    </div>
  );
}