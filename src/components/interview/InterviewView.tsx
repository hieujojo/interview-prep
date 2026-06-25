"use client";

import { useAIReview } from "@/hooks/useAIReview";
import { useTopics } from "@/hooks/useTopics";
import { useInterviewSession, formatTime } from "@/hooks/useInterviewSession";

function getTopicLogo(topicName: string) {
  const name = topicName.toLowerCase();
  if (name.includes("react native")) return "/logo/react-native-removebg-preview.png";
  if (name.includes("react")) return "/logo/reactjs.png";
  if (name.includes("html")) return "/logo/HTML5_logo_resized.png";
  if (name.includes("css") || name.includes("tailwind")) return "/logo/css.png";
  if (name.includes("typescript")) return "/logo/typescript-logo-png_seeklogo-526730.png";
  if (name.includes("javascript")) return "/logo/javascript.png";
  if (name.includes("node")) return "/logo/nodejs-new.png";
  if (name.includes("next")) return "/logo/nextjs-new.png";
  if (name.includes("mongo")) return "/logo/MongoDB-Emblem-2048x1280-removebg-preview.png";
  if (name.includes("docker")) return "/logo/docker-mark-ocean-blue-removebg-preview.png";
  if (name.includes("kỹ năng mềm") || name.includes("soft skill")) return "/logo/soft-skill.png";
  if (name.includes("sql")) return "/logo/sql.png";
  if (name.includes("git")) return "/logo/git5-removebg-preview.png";
  if (name.includes(".net") || name.includes("c#")) return "/logo/dotnet_.png";
  return "📝";
}

function TopicLogo({ name, className }: { name: string; className?: string }) {
  const logo = getTopicLogo(name);
  return logo.startsWith("/")
    ? <img src={logo} alt={name} className={className ?? "w-full h-full object-contain"} />
    : <span className="text-xl">{logo}</span>;
}

function FeedbackSection({ icon, label, content, color, bg }: {
  icon: string; label: string; content: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${color}30` }}>
      <p className="text-[13px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color }}>
        <span className="text-lg">{icon}</span> {label}
      </p>
      <p className="text-[15px] whitespace-pre-wrap leading-relaxed text-foreground">{content}</p>
    </div>
  );
}

export const InterviewView = () => {
  const { review } = useAIReview();
  const { topics, isLoading, error: topicsError } = useTopics();

  const {
    // setup
    selections, selectedTopics, totalQuestionsSelected,
    handleToggleTopic, handleUpdateCount, startSession, resetSession,
    // questions
    questions, isLoadingQuestions, loadError,
    currentIndex, currentQuestion, current, isLastQuestion, isFinished, answers,
    setUserAnswer,
    // timer
    timeLeft,
    // hint
    isHinting, currentHint, requestHint,
    // voice
    isListening, toggleListening,
    // review
    isReviewing, reviewError, handleSubmitReview, handleNext,
    // save
    isSaving, saveError, isSaved,
  } = useInterviewSession(review);

  // ── Setup Screen ──
  if (!selections) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 animate-fadeInUp">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-3" style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            🎯 Phỏng vấn AI (Mix Topics)
          </h1>
          <p className="text-base text-muted max-w-2xl mx-auto">
            Xây dựng phiên phỏng vấn tùy chỉnh của riêng bạn bằng cách chọn các chủ đề và phân bổ số lượng câu hỏi phù hợp.
          </p>
        </div>

        {isLoading && <div className="skeleton h-32 rounded-2xl max-w-4xl mx-auto" />}
        {topicsError && <p className="text-danger text-center font-bold p-4">{topicsError}</p>}

        {!isLoading && !topicsError && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topics.map((topic) => {
                const active = !!selectedTopics[topic.name];
                return (
                  <div
                    key={topic.id}
                    className="flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
                    onClick={() => handleToggleTopic(topic.name, topic.questionCount)}
                    style={{
                      background: active ? "rgba(139,92,246,0.12)" : "var(--surface)",
                      border: `1px solid ${active ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
                      transform: active ? "scale(1.02)" : "scale(1)",
                      boxShadow: active ? "0 10px 25px -5px rgba(139,92,246,0.2)" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 p-1">
                        <TopicLogo name={topic.name} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-[15px] truncate text-foreground group-hover:text-primary transition-colors">{topic.name}</p>
                        <p className="text-xs text-muted">Có sẵn {topic.questionCount} câu</p>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary border-primary" : "border-muted"}`}>
                        {active && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </div>
                    {active && (
                      <div className="pt-3 border-t border-border mt-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between animate-fadeIn">
                          <span className="text-sm font-medium text-muted">Số câu chọn:</span>
                          <input
                            type="number" min={1} max={topic.questionCount}
                            value={selectedTopics[topic.name]}
                            onChange={(e) => handleUpdateCount(topic.name, parseInt(e.target.value) || 0, topic.questionCount)}
                            className="w-16 px-2 py-1 text-sm font-bold rounded-lg bg-surface-2 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="max-w-2xl mx-auto rounded-3xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 20px 40px -15px rgba(139,92,246,0.15)" }}>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-muted text-sm font-medium mb-1">Tổng quan thiết lập</p>
                  <p className="text-foreground text-xl">
                    Bạn đã chọn <span className="font-extrabold text-primary text-3xl mx-1">{totalQuestionsSelected}</span> câu hỏi
                  </p>
                </div>
                <button disabled={totalQuestionsSelected === 0} onClick={startSession} className="btn-gradient px-10 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30">
                  <span>🚀</span> Bắt đầu thử thách
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Loading Screen ──
  if (isLoadingQuestions)
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <div className="skeleton h-10 w-1/3 rounded-2xl mx-auto" />
        <div className="skeleton h-64 rounded-3xl mt-8" />
      </div>
    );

  if (loadError) return <p className="text-danger p-4 text-center font-bold text-lg mt-10">{loadError}</p>;

  if (questions.length === 0)
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 text-center rounded-3xl bg-surface border border-border shadow-xl">
        <span className="text-5xl mb-4 block">📭</span>
        <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy câu hỏi</h2>
        <p className="text-muted mb-8">Không có câu hỏi nào phù hợp với các chủ đề bạn đã chọn.</p>
        <button onClick={resetSession} className="btn-gradient px-8 py-3 rounded-xl font-bold">Quay lại chọn Topic</button>
      </div>
    );

  // ── Finish Screen ──
  if (isFinished) {
    const avgScore = answers.length
      ? answers.reduce((sum, a) => sum + (a.feedback?.score ?? 0), 0) / answers.length
      : 0;
    const scoreColor = avgScore >= 7 ? "var(--success)" : avgScore >= 5 ? "var(--warning)" : "var(--danger)";
    const badAnswers = answers.filter((a) => (a.feedback?.score ?? 0) < 5);

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-scaleIn">
        <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: "var(--surface)", border: `1px solid ${scoreColor}50`, boxShadow: `0 20px 50px -20px ${scoreColor}20` }}>
          <div className="text-7xl mb-6 animate-float">🎉</div>
          <h1 className="text-4xl font-extrabold mb-6" style={{ color: "var(--foreground)" }}>Báo cáo Tổng Kết</h1>
          <div className="inline-flex flex-col items-center justify-center w-36 h-36 rounded-full mb-6" style={{ border: `6px solid ${scoreColor}` }}>
            <span className="text-5xl font-extrabold" style={{ color: scoreColor }}>{avgScore.toFixed(1)}</span>
            <span className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: "var(--muted)" }}>Điểm TB</span>
          </div>
          <div className="p-4 mt-8 max-w-md mx-auto rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {isSaving && <p className="text-sm font-bold text-warning flex justify-center gap-2"><span className="animate-spin">⏳</span> Đang lưu kết quả...</p>}
            {isSaved && <p className="text-sm font-bold text-success flex justify-center gap-2"><span>✅</span> Đã lưu kết quả thành công.</p>}
            {saveError && <p className="text-sm font-bold text-danger">❌ Lỗi lưu: {saveError}</p>}
          </div>
          <button onClick={resetSession} className="mt-8 text-sm font-bold text-primary hover:underline">← Quay về Chọn Topic Mới</button>
        </div>

        {badAnswers.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold mt-12 mb-6 flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <span className="text-foreground">Lỗ hổng kiến thức cần ôn lại ngay</span>
            </h2>
            {badAnswers.map((ans, idx) => (
              <div key={idx} className="rounded-3xl p-6 space-y-4 shadow-lg" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "var(--surface)" }}>
                <div className="flex gap-3 items-start border-b border-border pb-4">
                  <div className="w-10 h-10 rounded-xl bg-danger-bg text-danger font-extrabold flex items-center justify-center text-lg shrink-0">{ans.feedback?.score}</div>
                  <div>
                    <p className="text-xs font-bold text-danger uppercase tracking-wider mb-1">{ans.question.category}</p>
                    <p className="font-bold text-[15px] leading-relaxed text-foreground">{ans.question.content}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-surface-hover rounded-2xl text-sm border border-border">
                    <p className="text-danger text-xs font-bold mb-2 uppercase tracking-widest flex items-center gap-2"><span>⚠️</span> Bạn đã trả lời</p>
                    <p className="text-foreground-2 leading-relaxed">{ans.userAnswer}</p>
                  </div>
                  <div className="p-4 bg-info-bg rounded-2xl text-sm border border-info/20 text-info">
                    <p className="font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2"><span>💡</span> Hướng khắc phục (AI)</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{ans.feedback?.improvements}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Active Question Screen ──
  if (!currentQuestion || !current) return null;

  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 animate-fadeInUp">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-bg rounded-xl flex items-center justify-center">
            <TopicLogo name={currentQuestion.category} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-primary mb-0.5">{currentQuestion.category}</span>
            <span className="block text-sm font-semibold text-muted">Câu {currentIndex + 1} trên tổng {questions.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentHint && <span className="text-xs text-warning font-bold bg-warning-bg px-3 py-1.5 rounded-full">💡 Đã dùng gợi ý</span>}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold shadow-sm ${timeLeft < 30 && !current.feedback ? "text-danger bg-danger-bg animate-pulse" : "text-info bg-info-bg"}`}>
            <span className="text-lg">⏱️</span> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Câu hỏi từ nhà tuyển dụng</p>
        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-foreground">{currentQuestion.content}</h2>
      </div>

      {currentHint && (
        <div className="p-5 rounded-2xl text-[15px] bg-warning-bg text-warning border border-warning/30 animate-fadeIn flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <p className="font-bold mb-1 uppercase text-xs tracking-widest">Gợi ý siêu việt</p>
            {currentHint}
          </div>
        </div>
      )}

      <div className="relative group">
        <textarea
          value={current.userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={!!current.feedback}
          rows={7}
          placeholder="Nhập câu trả lời chi tiết của bạn tại đây hoặc bấm Micro để đọc..."
          className="w-full text-[15px] leading-relaxed rounded-3xl p-6 pr-16 resize-none transition-all duration-300 focus:outline-none bg-surface text-foreground shadow-sm focus:shadow-xl focus:shadow-primary/10"
          style={{ border: current.feedback ? "1px solid var(--border)" : "2px solid var(--border-bright)" }}
        />
        {!current.feedback && (
          <div className="absolute bottom-5 right-5 flex flex-col items-center gap-3">
            {!currentHint && (
              <button onClick={requestHint} disabled={isHinting} className="w-12 h-12 rounded-full bg-surface border border-border shadow-md hover:bg-warning-bg hover:border-warning/50 hover:text-warning transition-all flex items-center justify-center text-xl" title="Xin gợi ý">
                {isHinting ? <span className="animate-spin text-sm">⏳</span> : "💡"}
              </button>
            )}
            <button onClick={toggleListening} className={`w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center text-2xl ${isListening ? "bg-danger text-white animate-pulse scale-110" : "bg-primary text-white hover:scale-105"}`} title="Trả lời bằng giọng nói">
              🎙️
            </button>
          </div>
        )}
      </div>

      {reviewError && <p className="text-sm p-4 rounded-xl text-danger bg-danger-bg font-medium">{reviewError}</p>}

      {!current.feedback ? (
        <button onClick={handleSubmitReview} disabled={!current.userAnswer.trim() || isReviewing} className="btn-gradient w-full py-4 rounded-2xl text-[15px] font-extrabold flex justify-center items-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]">
          {isReviewing ? <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Đang phân tích siêu tốc...</span> : "✨ Nộp bài & Nhận Review ngay"}
        </button>
      ) : (
        <div className="rounded-3xl overflow-hidden animate-scaleIn border border-border shadow-2xl">
          <div className="px-6 py-5 flex items-center justify-between bg-surface border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <p className="font-extrabold text-[15px] text-foreground">AI Technical Review</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm ${current.feedback.score >= 7 ? "text-success bg-success-bg" : current.feedback.score >= 5 ? "text-warning bg-warning-bg" : "text-danger bg-danger-bg"}`}>
              ⭐ Điểm đánh giá: {current.feedback.score}/10
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-5 bg-surface-2">
            <FeedbackSection icon="✅" label="Điểm mạnh ấn tượng" content={current.feedback.strengths} color="var(--success)" bg="var(--success-bg)" />
            <FeedbackSection icon="⚠️" label="Lỗ hổng cần vá" content={current.feedback.gaps} color="var(--warning)" bg="var(--warning-bg)" />
            <FeedbackSection icon="💡" label="Cách upgrade câu trả lời" content={current.feedback.improvements} color="var(--info)" bg="var(--info-bg)" />
            <button onClick={handleNext} className="btn-gradient w-full py-4 rounded-2xl text-[15px] font-extrabold flex items-center justify-center gap-2 mt-6 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
              {isLastQuestion ? "🏁 Hoàn tất phiên phỏng vấn" : "🚀 Tiếp tục câu tiếp theo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};