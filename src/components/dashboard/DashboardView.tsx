"use client";

import Link from "next/link";
import type { DashboardData } from "@/hooks/useDashboardData";

type Props = {
  data: DashboardData;
};

const MOTIVATIONAL_QUOTES = [
  "Mỗi câu hỏi bạn luyện hôm nay là một bước gần hơn đến offer mơ ước! 🌟",
  "Consistency beats talent. Luyện tập đều đặn là chìa khóa thành công! 🔑",
  "Bạn đang làm tốt hơn version hôm qua của mình! Keep going! 💪",
  "Senior dev cũng từng là Intern. Hãy tiếp tục học mỗi ngày! 🚀",
];

const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  interview: { label: "Phỏng vấn", icon: "🎯", color: "var(--info)" },
  code_review: { label: "Code Review", icon: "🔍", color: "var(--warning)" },
  jd_analysis: { label: "Phân tích JD", icon: "📋", color: "var(--success)" },
};

export default function DashboardView({ data }: Props) {
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];
  const scoreColor =
    data.averageScore === null
      ? "var(--muted)"
      : data.averageScore >= 7
      ? "var(--success)"
      : data.averageScore >= 5
      ? "var(--warning)"
      : "var(--danger)";

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 50%, rgba(168,85,247,0.05) 100%)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Background orbs */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />

        <div className="relative">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--primary-light)" }}>
            Chào mừng trở lại 👋
          </p>
          <h1
            className="text-3xl font-extrabold mb-3"
            style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm max-w-lg" style={{ color: "var(--foreground-2)" }}>
            {quote}
          </p>

          {/* Overall progress bar */}
          {data.totalSessions > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Tiến độ luyện tập
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--primary-light)" }}>
                  {data.totalSessions} buổi
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (data.totalSessions / 20) * 100)}%`,
                    background: "var(--gradient-primary)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${data.streakDays} ngày`}
          iconBg="var(--gradient-gold)"
          delay="delay-100"
        />
        <StatCard
          icon="📚"
          label="Tổng buổi"
          value={`${data.totalSessions}`}
          iconBg="var(--gradient-primary)"
          delay="delay-200"
        />
        <StatCard
          icon="🏷️"
          label="Topic đã cover"
          value={`${data.topicsCovered.length}`}
          iconBg="var(--gradient-success)"
          delay="delay-300"
        />
        <StatCard
          icon="⭐"
          label="Điểm trung bình"
          value={data.averageScore !== null ? `${data.averageScore.toFixed(1)}/10` : "—"}
          iconBg="var(--gradient-accent)"
          valueColor={data.averageScore !== null ? scoreColor : undefined}
          delay="delay-400"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground-2)" }}>
          Bắt đầu nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            href="/interview"
            icon="🎯"
            title="Phỏng vấn AI"
            desc="Luyện câu hỏi theo topic"
            gradient="var(--gradient-primary)"
          />
          <QuickAction
            href="/jd-analyzer"
            icon="📋"
            title="Phân tích JD"
            desc="Sinh câu hỏi từ Job Description"
            gradient="var(--gradient-success)"
          />
          <QuickAction
            href="/code-review"
            icon="🔍"
            title="Code Review"
            desc="AI review code của bạn"
            gradient="var(--gradient-accent)"
          />
        </div>
      </div>

      {/* ── Topics covered ── */}
      {data.topicsCovered.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            🏷️ Topic đã luyện
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.topicsCovered.map((topic, i) => (
              <span
                key={topic}
                className="px-3 py-1.5 rounded-full text-xs font-medium animate-fadeIn"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "var(--primary-light)",
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent sessions ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            📅 Buổi gần nhất
          </h2>
          <Link
            href="/history"
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "var(--primary-light)" }}
          >
            Xem tất cả →
          </Link>
        </div>

        {data.recentSessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {data.recentSessions.map((session, i) => {
              const info = TYPE_INFO[session.type];
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl animate-fadeIn"
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{
                        background: `${info?.color ?? "var(--muted)"}18`,
                        border: `1px solid ${info?.color ?? "var(--border)"}30`,
                      }}
                    >
                      {info?.icon ?? "📝"}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {session.topic ?? "—"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {info?.label ?? session.type}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                    {new Date(session.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  icon,
  label,
  value,
  iconBg,
  valueColor,
  delay = "",
}: {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
  valueColor?: string;
  delay?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 animate-fadeInUp ${delay}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        el.style.borderColor = "var(--border-bright)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "var(--border)";
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p
        className="text-2xl font-extrabold"
        style={{ color: valueColor ?? "var(--foreground)", letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  desc,
  gradient,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-4 block group"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        el.style.borderColor = "rgba(139,92,246,0.4)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "var(--border)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform duration-200 group-hover:scale-110"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {desc}
      </p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="py-12 text-center rounded-2xl animate-fadeIn"
      style={{
        background: "var(--surface)",
        border: "1px dashed var(--border-bright)",
      }}
    >
      <div className="text-5xl mb-4 animate-float">🎓</div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
        Chưa có buổi luyện tập nào
      </p>
      <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
        Bắt đầu buổi đầu tiên để theo dõi tiến độ của bạn!
      </p>
      <Link
        href="/interview"
        className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
      >
        🎯 Bắt đầu phỏng vấn ngay
      </Link>
    </div>
  );
}