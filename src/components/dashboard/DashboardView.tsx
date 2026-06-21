import Link from "next/link";
import type { DashboardData } from "@/hooks/useDashboardData";

type Props = {
  data: DashboardData;
};

export default function DashboardView({ data }: Props) {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Streak" value={`🔥 ${data.streakDays} ngày`} />
        <StatCard label="Tổng buổi" value={`${data.totalSessions}`} />
        <StatCard label="Topic đã cover" value={`${data.topicsCovered.length}`} />
        <StatCard
          label="Điểm trung bình"
          value={data.averageScore !== null ? `${data.averageScore.toFixed(1)}/10` : "—"}
        />
      </div>

      {data.topicsCovered.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Topic đã luyện</h2>
          <div className="flex flex-wrap gap-2">
            {data.topicsCovered.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 rounded-full text-sm bg-surface border border-border text-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Buổi gần nhất</h2>
          <Link href="/history" className="text-sm text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        {data.recentSessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {data.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-md bg-surface border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{session.topic ?? "—"}</p>
                  <p className="text-xs text-muted">{typeLabel(session.type)}</p>
                </div>
                <p className="text-xs text-muted">
                  {new Date(session.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-md bg-surface border border-border">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center rounded-md bg-surface border border-border">
      <p className="text-muted text-sm mb-3">Chưa có buổi luyện tập nào.</p>
      <Link
        href="/interview"
        className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        Bắt đầu phỏng vấn ngay
      </Link>
    </div>
  );
}

function typeLabel(type: string) {
  if (type === "interview") return "Phỏng vấn";
  if (type === "code_review") return "Code Review";
  if (type === "jd_analysis") return "Phân tích JD";
  return type;
}