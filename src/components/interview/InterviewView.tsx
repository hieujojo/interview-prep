"use client";

import { useAIReview } from "@/hooks/useAIReview";
import { useTopics } from "@/hooks/useTopics";
import { useTopicGrouping } from "@/hooks/useTopicGrouping";
import { useInterviewSession, formatTime } from "@/hooks/useInterviewSession";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import { useCVTopicRecommendations } from "@/hooks/useCVTopicRecommendations";
import { CVRecommendationsPanel } from "@/components/interview/CVRecommendationsPanel";
import { NoteDrawer } from '@/components/notes/NoteDrawer';
import { ScoreBreakdown } from "@/components/interview/ScoreBreakdown";
import { TopicLogo } from "@/components/interview/TopicCard";
import { TopicCategorySection } from "@/components/interview/TopicCategorySection";
import { useState } from 'react';
import { MarkdownContent } from "@/components/interview/MarkdownContent";

function FeedbackSection({ icon, label, content, color, bg }: {
  icon: string; label: string; content: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${color}30` }}>
      <p className="text-[13px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color }}>
        <span className="text-lg">{icon}</span> {label}
      </p>
      <MarkdownContent content={content} />
    </div>
  );
}

function ExampleBlock({ content }: { content: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(99,102,241,0.07)",
        border: "1px solid rgba(99,102,241,0.25)",
        borderLeft: "4px solid var(--primary)",
      }}
    >
      <p
        className="text-[13px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2"
        style={{ color: "var(--primary)" }}
      >
        <span className="text-lg">📌</span> Câu trả lời mẫu
      </p>
     <MarkdownContent content={content} />
    </div>
  );
}

const RUBRIC_ITEMS = [
  { icon: "🎯", label: "Technical Accuracy", weight: 40, desc: "Độ chính xác kỹ thuật — kiến thức đúng, không sai khái niệm" },
  { icon: "🧩", label: "Problem Solving", weight: 25, desc: "Tư duy phân tích, có hướng giải quyết rõ ràng" },
  { icon: "💬", label: "Communication", weight: 20, desc: "Diễn đạt mạch lạc, có cấu trúc, dễ hiểu" },
  { icon: "⭐", label: "Best Practices", weight: 15, desc: "Đề cập kinh nghiệm thực tế, best practices" },
];

function RubricPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((v: boolean) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-bold transition-all"
        style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          color: "var(--primary)",
        }}
      >
        <span className="flex items-center gap-2">
          <span>📊</span> AI chấm điểm theo tiêu chí nào?
        </span>
        <span className="text-xs transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>

      {open && (
        <div
          className="mt-2 rounded-2xl p-5 space-y-3 animate-fadeIn"
          style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <p className="text-xs text-muted mb-4">
            Mỗi câu trả lời được AI chấm theo 4 tiêu chí sau. Điểm tổng = tổng điểm có trọng số.
          </p>
          {RUBRIC_ITEMS.map(({ icon, label, weight, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-bold text-foreground">{label}</span>
                  <span
                    className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.15)", color: "var(--primary)" }}
                  >
                    ×{weight}%
                  </span>
                </div>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
          ))}
          <div
            className="pt-3 mt-2 border-t space-y-3"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Thang điểm chung</p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { range: "8–10", label: "Xuất sắc", color: "var(--success)", bg: "var(--success-bg)" },
                { range: "5–7", label: "Đạt", color: "var(--warning)", bg: "var(--warning-bg)" },
                { range: "1–4", label: "Yếu", color: "var(--danger)", bg: "var(--danger-bg)" },
                { range: "0", label: "Không có", color: "var(--muted)", bg: "var(--surface)" },
              ].map(({ range, label, color, bg }) => (
                <div key={range} className="rounded-xl py-2 px-1" style={{ background: bg, border: `1px solid ${color}30` }}>
                  <p className="font-extrabold text-sm" style={{ color }}>{range}</p>
                  <p style={{ color }} className="opacity-80 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted font-mono">
              Điểm tổng = (Technical×0.4) + (Problem×0.25) + (Comm×0.2) + (Best×0.15)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const InterviewView = () => {
  const { review } = useAIReview();
  const {
    topics, isLoading, error: topicsError,
    expandedTopics, expandTopic, collapseTopic,
    categorySelections, toggleCategory,
    topicCounts, setCountForTopic, getMaxForTopic, getCountForTopic,
    mode, setMode, clearCategorySelection
  } = useTopics();

  // Derived data only (no side effects) — grouping is pure computation off `topics`,
  // so it lives in its own hook and is just called here, per project rule 2.1.
  const groupedTopics = useTopicGrouping(topics);

  const {
    selections, setSelections, selectedTopics, totalQuestionsSelected,
    handleToggleTopic, handleUpdateCount, startSession, resetSession,
    questions, isLoadingQuestions, loadError,
    currentIndex, currentQuestion, current, isLastQuestion, isFinished, answers,
    setUserAnswer,
    timeLeft,
    isHinting, currentHint, requestHint,
    isListening, toggleListening,
    isReviewing, reviewError, handleSubmitReview, handleNext,
    isSaving, saveError, isSaved,
    inProgressNotes,
    updateNote,
    isNoteDrawerOpen,
    setIsNoteDrawerOpen,
    isRegenerating, regenerateError, handleRegenerate
  } = useInterviewSession(review);

  // ── CV-based recommendations ──
  const { result: cvResult } = useCVAnalysis();
  const { recommended, challenge } = useCVTopicRecommendations(cvResult, topics);

  /**
   * When user clicks a topic chip in the recommendations panel:
   * In quick mode  → toggle topic on (if not already selected)
   * In custom mode → expand the topic's category panel
   */
  const handleSelectRecommendedTopic = (topicName: string) => {
    const topic = topics.find((t) => t.name === topicName);
    if (!topic) return;
    if (mode === "quick") {
      if (!selectedTopics[topicName]) {
        handleToggleTopic(topicName, topic.questionCount);
      }
    } else {
      if (!expandedTopics.has(topicName)) {
        expandTopic(topicName);
      }
    }
    // Scroll to the topic grid
    document.getElementById(`cv-recommendations-panel`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Tổng số câu hỏi đã chọn — dùng chung cho cả quick lẫn custom mode,
  // được tách riêng để summary panel (bên phải) và nút submit dùng chung 1 nguồn.
  const totalSelectedCount =
    mode === "quick"
      ? totalQuestionsSelected
      : [...categorySelections.keys()].reduce((sum: number, topicName: string) => {
          const topic = topics.find((t) => t.name === topicName);
          if (!topic) return sum;
          const max = getMaxForTopic(topic);
          return sum + getCountForTopic(topicName, max);
        }, 0);

  const handleStartSession = () => {
    if (mode === "quick") {
      startSession();
      return;
    }
    const arr = topics
      .filter((t) => categorySelections.has(t.name))
      .map((t) => {
        const max = getMaxForTopic(t);
        return {
          topic: t.name,
          count: getCountForTopic(t.name, max),
          categories: [...(categorySelections.get(t.name) ?? [])],
        };
      });
    if (arr.length > 0) setSelections(arr);
  };

  const isStartDisabled = mode === "quick" ? totalQuestionsSelected === 0 : categorySelections.size === 0;

  // ── Setup Screen ──
  if (!selections) {
    return (
      <div className="w-full space-y-6 py-8 px-6 animate-fadeInUp">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-3" style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            🎯 Phỏng vấn AI (Mix Topics)
          </h1>
          <p className="text-base text-muted max-w-2xl mx-auto">
            Xây dựng phiên phỏng vấn tùy chỉnh của riêng bạn bằng cách chọn các chủ đề và phân bổ số lượng câu hỏi phù hợp.
          </p>

          <div className="relative flex items-center justify-center gap-2 mt-4 p-1 rounded-2xl bg-surface border border-border w-fit mx-auto">
            <div
              className="absolute top-1 bottom-1 rounded-xl bg-primary shadow-md transition-all duration-300 ease-in-out"
              style={{
                width: "calc(50% - 6px)",
                left: mode === "quick" ? "4px" : "calc(50% + 2px)",
              }}
            />

            <div className="relative group">
              <button
                onClick={() => setMode("quick")}
                className={`relative z-10 px-5 py-2 rounded-xl text-sm font-bold transition-colors duration-300 focus:outline-none ${mode === "quick" ? "text-white" : "text-muted hover:text-foreground"}`}
              >
                ⚡ Quick Mode
              </button>
              <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                <div className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap" style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.35)", color: "var(--foreground)", boxShadow: "0 8px 24px -4px rgba(0,0,0,0.4)" }}>
                  🎲 Chọn chủ đề & số câu, hệ thống tự trộn ngẫu nhiên
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid rgba(139,92,246,0.35)" }} />
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={() => setMode("custom")}
                className={`relative z-10 px-5 py-2 rounded-xl text-sm font-bold transition-colors duration-300 focus:outline-none ${mode === "custom" ? "text-white" : "text-muted hover:text-foreground"}`}
              >
                🎯 Custom mode
              </button>
              <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                <div className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap" style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.35)", color: "var(--foreground)", boxShadow: "0 8px 24px -4px rgba(0,0,0,0.4)" }}>
                  🗂️ Tự chọn danh mục cụ thể trong từng chủ đề
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid rgba(139,92,246,0.35)" }} />
              </div>
            </div>
          </div>
        </div>

        {isLoading && <div className="skeleton h-32 rounded-2xl max-w-4xl mx-auto" />}
        {topicsError && <p className="text-danger text-center font-bold p-4">{topicsError}</p>}

        {!isLoading && !topicsError && (
          // ── 2 CỘT: trái = chọn topic (cuộn tự nhiên), phải = tổng quan sticky ──
          <div className="flex flex-col lg:flex-row gap-6 items-start max-w-[1800px] mx-auto">
            {/* CỘT TRÁI */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Topics grouped by category (Frontend / Backend / Database / DevOps / ...) */}
              <div className="space-y-8">
                {groupedTopics.map((group) => (
                  <TopicCategorySection
                    key={group.key}
                    group={group}
                    mode={mode}
                    selectedTopics={selectedTopics}
                    expandedTopics={expandedTopics}
                    categorySelections={categorySelections}
                    onToggleTopic={handleToggleTopic}
                    onExpandTopic={expandTopic}
                    onCollapseTopic={collapseTopic}
                    onClearCategorySelection={clearCategorySelection}
                    onUpdateCount={handleUpdateCount}
                    setCountForTopic={setCountForTopic}
                    getMaxForTopic={getMaxForTopic}
                    getCountForTopic={getCountForTopic}
                  />
                ))}
              </div>

            </div>

            {/* CỘT PHẢI — sticky, luôn nằm trong tầm mắt khi cuộn cột trái */}
            <div className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-6 space-y-4">
              {/* Gợi ý từ CV */}
              {cvResult && (recommended.length > 0 || challenge.length > 0) && (
                <CVRecommendationsPanel
                  recommended={recommended}
                  challenge={challenge}
                  currentLevel={cvResult.currentLevel ?? "Fresher"}
                  onSelectTopic={handleSelectRecommendedTopic}
                />
              )}

              {/* AI chấm điểm theo tiêu chí nào */}
              <RubricPanel />

              {/* Chọn danh mục (chỉ hiện ở custom mode, sau khi mở rộng 1 topic) */}
              {mode === "custom" && expandedTopics.size > 0 && (
                <div
                  className="rounded-2xl p-5 animate-fadeIn space-y-5 max-h-[420px] overflow-y-auto"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.25)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                    Chọn danh mục
                  </p>

                  {topics
                    .filter((t) => expandedTopics.has(t.name))
                    .map((topic) => (
                      <div key={topic.name} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 shrink-0">
                            <TopicLogo name={topic.name} className="w-full h-full object-contain" />
                          </div>
                          <p className="text-sm font-bold text-foreground">{topic.name}</p>
                          <span className="text-xs text-muted">
                            ({[...(categorySelections.get(topic.name) ?? [])].length} danh mục đã chọn)
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pl-7">
                          {topic.categories.map((cat) => (
                            <span
                              key={cat.name}
                              onClick={() => toggleCategory(topic.name, cat.name)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5
                                ${categorySelections.get(topic.name)?.has(cat.name)
                                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                                  : "bg-surface border-border text-foreground hover:border-primary hover:text-primary"
                                }`}
                            >
                              {cat.name}
                              <span className="opacity-50">({cat.count})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))",
                  border: "1px solid rgba(139,92,246,0.3)",
                  boxShadow: "0 20px 40px -15px rgba(139,92,246,0.15)",
                }}
              >
                <div className="relative z-10 flex flex-col gap-5">
                  <div>
                    <p className="text-muted text-sm font-medium mb-1">Tổng quan thiết lập</p>
                    <p className="text-foreground text-xl">
                      Bạn đã chọn{" "}
                      <span className="font-extrabold text-primary text-3xl mx-1">{totalSelectedCount}</span>{" "}
                      câu hỏi
                    </p>
                  </div>

                  <button
                    disabled={isStartDisabled}
                    onClick={handleStartSession}
                    className="btn-gradient w-full px-6 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30"
                  >
                    <span>🚀</span> Bắt đầu thử thách
                  </button>
                </div>
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
                {ans.feedback && <ScoreBreakdown feedback={ans.feedback} />}
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
                {/* ExampleBlock trong Finish Screen */}
                {ans.feedback?.example && (
                  <ExampleBlock content={ans.feedback.example} />
                )}
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
    <>
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
          <button
            onClick={() => setIsNoteDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold bg-surface border border-border hover:border-primary hover:text-primary transition-all shadow-sm"
            title="Ghi chú"
          >
            📝 Ghi chú
          </button>
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
              {/* ExampleBlock — ô riêng biệt cho code minh hoạ */}
              {current.feedback.example && (
                <ExampleBlock content={current.feedback.example} />
              )}
              {current.feedback && <ScoreBreakdown feedback={current.feedback} />}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border border-border bg-surface hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegenerating
                    ? <><span className="animate-spin">⏳</span> Đang tạo lại...</>
                    : <><span>🔄</span> Regenerate</>
                  }
                </button>
                <button onClick={handleNext} className="btn-gradient flex-1 py-3 rounded-2xl text-[15px] font-extrabold ...">
                  {isLastQuestion ? "🏁 Hoàn tất" : "🚀 Câu tiếp theo"}
                </button>
              </div>

              {regenerateError && (
                <p className="text-sm p-3 rounded-xl text-danger bg-danger-bg">{regenerateError}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <NoteDrawer
        open={isNoteDrawerOpen}
        onClose={() => setIsNoteDrawerOpen(false)}
        questions={questions}
        notes={inProgressNotes}
        currentIndex={currentIndex}
        onUpdateNote={updateNote}
      />
    </>
  );
};