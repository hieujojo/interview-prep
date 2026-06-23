"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import AchievementsView from "@/components/dashboard/AchievementsView";

export default function AchievementsPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) return <p className="text-muted">Đang tải thành tựu...</p>;
  if (error) return <p className="text-danger">Lỗi: {error}</p>;
  if (!data) return null;

  return <AchievementsView data={data} />;
}
