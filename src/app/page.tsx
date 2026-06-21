"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardView from "@/components/dashboard/DashboardView";

export default function Home() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) return <p className="text-muted">Đang tải dashboard...</p>;
  if (error) return <p className="text-danger">Lỗi: {error}</p>;
  if (!data) return null;

  return <DashboardView data={data} />;
}