"use client";

import { useState, useEffect } from "react";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useAIReview } from "@/hooks/useAIReview";
import { useTopics } from "@/hooks/useTopics";

/* ── Shared style helpers ── */
const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
};

export const InterviewView = () => {
  const [session, setSession] = useState<{ topic: string; count: number } | null>(null);

  const { topics, isLoading, error: topicsError } = useTopics();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicCount, setSelectedTopicCount] = useState<number>(0);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const {
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
    isSaved,
    saveError,
  } = useInterviewSession(session?.topic ?? "", session?.count ?? 0);

  const { review, isReviewing, error: reviewError } = useAIReview();

  const handleSubmitReview = async () => {
    const current = answers[currentIndex];
    const result = await review(session!.topic, currentQuestion, current.userAnswer);
    if (result) setFeedback(result);
  };

  useEffect(() => {
    if (isFinished && !isSaved && !isSaving && !saveError) saveSession();
  }, [isFinished, isSaved, isSaving, saveError, saveSession]);

  const countOptions = [
    { label: "5 câu", value: 5 },
    { label: "10 câu", value: 10 },
    { label: "20 câu", value: 20 },
    ...(selectedTopicCount > 20
      ? [{ label: `Tất cả (${selectedTopicCount})`, value: selectedTopicCount }]
      : []),
  ];

  // ── Topic selection screen ──
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4 animate-fadeInUp">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-extrabold mb-1"
            style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
          >
            🎯 Phỏng vấn AI
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Chọn topic và số câu hỏi để bắt đầu buổi luyện tập
          </p>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        )}
        {topicsError && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
            {topicsError}
          </p>
        )}

        {!isLoading && !topicsError && (
          <div className="space-y-6">
            {/* Step 1: Topic */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  1
                </span>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Chọn topic
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topics.map((topic) => {
                  const active = selectedTopic === topic.name;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic.name);
                        setSelectedTopicCount(topic.questionCount);
                        if (selectedCount > topic.questionCount) {
                          setSelectedCount(Math.min(10, topic.questionCount));
                        }
                      }}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: active ? "rgba(139,92,246,0.12)" : "var(--surface)",
                        border: `1px solid ${active ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
                        transform: active ? "scale(1.01)" : "scale(1)",
                        boxShadow: active ? "0 0 16px rgba(139,92,246,0.15)" : "none",
                      }}
                    >
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: active ? "var(--primary-light)" : "var(--foreground)" }}
                      >
                        {topic.name}
                      </span>
                      <span
                        className="text-xs ml-2 shrink-0 px-2 py-0.5 rounded-full"
                        style={{
                          background: active ? "rgba(139,92,246,0.2)" : "var(--surface-hover)",
                          color: active ? "var(--primary-light)" : "var(--muted)",
                        }}
                      >
                        {topic.questionCount} câu
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Count */}
            {selectedTopic && (
              <div className="animate-fadeInUp">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    2
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Số câu hỏi
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {countOptions.map((opt) => {
                    const active = selectedCount === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedCount(opt.value)}
                        disabled={opt.value > selectedTopicCount}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: active ? "var(--gradient-primary)" : "var(--surface)",
                          border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                          color: active ? "white" : "var(--foreground)",
                          boxShadow: active ? "0 4px 12px var(--primary-glow)" : "none",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary + Start */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.05))",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--muted)" }}>Topic đã chọn</span>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {selectedTopic ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--muted)" }}>Số câu hỏi</span>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {selectedTopic ? selectedCount : "—"}
                </span>
              </div>
              <button
                disabled={!selectedTopic}
                onClick={() =>
                  selectedTopic && setSession({ topic: selectedTopic, count: selectedCount })
                }
                className="btn-gradient w-full mt-1 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                🚀 Bắt đầu phỏng vấn
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Loading questions ──
  if (isLoadingQuestions)
    return (
      <div className="max-w-2xl mx-auto py-4 space-y-3 animate-fadeIn">
        <div className="skeleton h-4 w-32 rounded-full" />
        <div className="skeleton h-8 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );

  if (loadError)
    return (
      <p
        className="text-sm px-4 py-3 rounded-xl"
        style={{ color: "var(--danger)", background: "var(--danger-bg)" }}
      >
        {loadError}
      </p>
    );

  if (questions.length === 0)
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Topic &quot;{session.topic}&quot; chưa có câu hỏi nào.
      </p>
    );

  // ── Finish screen ──
  if (isFinished) {
    const totalScore = answers.reduce((sum, a) => sum + (a.feedback?.score ?? 0), 0);
    const avgScore = totalScore / answers.length;
    const scoreColor =
      avgScore >= 7 ? "var(--success)" : avgScore >= 5 ? "var(--warning)" : "var(--danger)";

    const goodAnswers = answers.filter(a => (a.feedback?.score ?? 0) >= 7).length;
    const okAnswers = answers.filter(a => (a.feedback?.score ?? 0) >= 5 && (a.feedback?.score ?? 0) < 7).length;
    const badAnswers = answers.filter(a => (a.feedback?.score ?? 0) < 5);

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4 animate-scaleIn">
        {/* Celebration */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(99,102,241,0.05))",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <div className="text-6xl mb-4 animate-float">🎉</div>
          <h1
            className="text-3xl font-extrabold mb-1"
            style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
          >
            Hoàn thành!
          </h1>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            Topic: <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{session.topic}</span>
          </p>

          {/* Score ring */}
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-4"
            style={{
              background: `conic-gradient(${scoreColor} ${avgScore * 36}deg, rgba(255,255,255,0.05) 0deg)`,
              boxShadow: `0 0 24px ${scoreColor}40`,
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center"
              style={{ background: "var(--surface)" }}
            >
              <span
                className="text-2xl font-extrabold"
                style={{ color: scoreColor, lineHeight: 1 }}
              >
                {avgScore.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                / 10
              </span>
            </div>
          </div>

          <p className="text-sm font-medium mb-6" style={{ color: "var(--foreground-2)" }}>
            {avgScore >= 8 ? "Xuất sắc! 🌟" : avgScore >= 6 ? "Khá tốt! 💪" : "Cần luyện thêm! 📚"}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-xl p-3" style={{ background: "var(--success-bg)", border: "1px solid rgba(52,211,153,0.25)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{goodAnswers}</p>
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--success)" }}>Tốt</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--warning-bg)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--warning)" }}>{okAnswers}</p>
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--warning)" }}>Tạm Ổn</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--danger-bg)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--danger)" }}>{badAnswers.length}</p>
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--danger)" }}>Cần Ôn Lại</p>
            </div>
          </div>
        </div>

        {/* Status messages */}
        <div style={card} className="rounded-2xl p-4">
          {isSaving && (
            <p className="text-sm flex items-center gap-2" style={{ color: "var(--muted)" }}>
              <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary) transparent transparent transparent" }} />
              Đang lưu vào lịch sử...
            </p>
          )}
          {isSaved && (
            <p className="text-sm flex items-center gap-2" style={{ color: "var(--success)" }}>
              Đã lưu vào lịch sử.
            </p>
          )}
          {saveError && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              Lỗi lưu: {saveError}
            </p>
          )}
        </div>

        {/* Wrong answers details */}
        {badAnswers.length > 0 && (
          <div className="space-y-4 animate-fadeInUp">
            <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: "var(--foreground)" }}>❌ Các câu trả lời yếu cần khắc phục</h2>
            {badAnswers.map((ans, idx) => (
              <div key={idx} className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--foreground)" }}>
                  Q: {ans.question}
                </p>
                <div className="p-4 rounded-xl" style={{ background: "var(--surface-hover)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--danger)" }}>Câu trả lời của bạn</p>
                  <p className="text-sm" style={{ color: "var(--foreground-2)" }}>{ans.userAnswer}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "var(--info-bg)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--info)" }}>Cách cải thiện</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--info)" }}>{ans.feedback?.improvements}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Question screen ──
  const current = answers[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-4 animate-fadeInUp">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary-light)" }}
          >
            {session.topic}
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Câu {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(139,92,246,0.12)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
        />
      </div>

      {/* Question card */}
      <div className="rounded-2xl p-6" style={card}>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--muted)" }}
        >
          Câu hỏi
        </p>
        <h2
          className="text-lg font-semibold leading-relaxed"
          style={{ color: "var(--foreground)" }}
        >
          {currentQuestion}
        </h2>
      </div>

      {/* Answer textarea */}
      <div>
        <label className="text-xs font-medium block mb-2" style={{ color: "var(--muted)" }}>
          Câu trả lời của bạn
        </label>
        <textarea
          value={current.userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={!!current.feedback}
          rows={7}
          placeholder="Viết câu trả lời của bạn ở đây..."
          className="w-full text-sm rounded-xl p-4 resize-none transition-all duration-200 focus:outline-none"
          style={{
            background: "var(--surface)",
            border: `1px solid ${current.feedback ? "var(--border)" : "var(--border-bright)"}`,
            color: "var(--foreground)",
            opacity: current.feedback ? 0.6 : 1,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = current.feedback ? "var(--border)" : "var(--border-bright)")}
        />
        {!current.feedback && (
          <p className="text-xs mt-1 text-right" style={{ color: "var(--muted)" }}>
            {current.userAnswer.length} ký tự
          </p>
        )}
      </div>

      {reviewError && (
        <p className="text-sm px-4 py-2 rounded-xl" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
          {reviewError}
        </p>
      )}

      {!current.feedback && (
        <button
          onClick={handleSubmitReview}
          disabled={!current.userAnswer.trim() || isReviewing}
          className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
        >
          {isReviewing ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Đang phân tích...
            </>
          ) : (
            "✨ AI Review"
          )}
        </button>
      )}

      {/* Feedback panel */}
      {current.feedback && (
        <div className="rounded-2xl overflow-hidden animate-scaleIn" style={{ border: "1px solid var(--border)" }}>
          {/* Score header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}
          >
            <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
              AI Feedback
            </p>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background:
                  current.feedback.score >= 7
                    ? "var(--success-bg)"
                    : current.feedback.score >= 5
                    ? "var(--warning-bg)"
                    : "var(--danger-bg)",
              }}
            >
              <span className="text-sm">⭐</span>
              <span
                className="text-sm font-bold"
                style={{
                  color:
                    current.feedback.score >= 7
                      ? "var(--success)"
                      : current.feedback.score >= 5
                      ? "var(--warning)"
                      : "var(--danger)",
                }}
              >
                {current.feedback.score}/10
              </span>
            </div>
          </div>

          {/* Feedback sections */}
          <div className="p-5 space-y-4" style={{ background: "var(--surface)" }}>
            <FeedbackSection
              icon="✅"
              label="Điểm mạnh"
              content={current.feedback.strengths}
              color="var(--success)"
              bg="var(--success-bg)"
            />
            <FeedbackSection
              icon="⚠️"
              label="Thiếu sót"
              content={current.feedback.gaps}
              color="var(--warning)"
              bg="var(--warning-bg)"
            />
            <FeedbackSection
              icon="💡"
              label="Cải thiện"
              content={current.feedback.improvements}
              color="var(--info)"
              bg="var(--info-bg)"
            />

            <button
              onClick={goNext}
              className="btn-gradient w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
            >
              {isLastQuestion ? "🏁 Kết thúc buổi" : "Câu tiếp theo →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function FeedbackSection({
  icon,
  label,
  content,
  color,
  bg,
}: {
  icon: string;
  label: string;
  content: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${color}25` }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color }}>
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground-2)" }}>
        {content}
      </p>
    </div>
  );
}