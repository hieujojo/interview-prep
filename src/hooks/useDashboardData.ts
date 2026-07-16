"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type RecentSession = {
  id: string;
  type: string;
  topic: string | null;
  created_at: string;
};

export type DashboardData = {
  totalSessions: number;
  topicsCovered: string[];
  recentSessions: RecentSession[];
  averageScore: number | null;
  streakDays: number;
  totalScore: number;
};

// Query key dùng chung — useInterviewSession.ts sẽ import cái này để gọi invalidateQueries
// ngay sau khi lưu session mới, ép Dashboard fetch lại dữ liệu tươi thay vì đợi cache hết hạn.
export const dashboardQueryKey = ["dashboardData"];

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = Array.from(new Set(dates.map((d) => new Date(d).toDateString()))).map((d) => new Date(d));
  uniqueDays.sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  for (const day of uniqueDays) {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cursor.getTime() - dayStart.getTime()) / 86400000);

    if (diffDays === 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diffDays === 1 && streak === 0) {
      streak += 1;
      cursor = new Date(dayStart);
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

async function fetchDashboardData(): Promise<DashboardData> {
  // 0. Lấy user hiện tại đang đăng nhập
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData?.user?.id;
  if (!userId) throw new Error("Không tìm thấy user đang đăng nhập.");

  // 1. Fetch 5 buổi gần nhất
  const { data: recentSessions, error: recentError } = await supabase
    .from("sessions")
    .select("id, type, topic, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentError) throw recentError;

  // 2. Fetch toàn bộ sessions + answers để tính số liệu tổng hợp
  //    (không còn đọc/ghi cache user_stats — React Query đảm nhiệm việc cache ở tầng client)
  const { data: allSessions, error: allSessionsError } = await supabase
    .from("sessions")
    .select("topic, created_at")
    .eq("user_id", userId);
  if (allSessionsError) throw allSessionsError;

  const { data: allAnswers, error: allAnswersError } = await supabase
    .from("answers")
    .select("score")
    .eq("user_id", userId)
    .not("score", "is", null);
  if (allAnswersError) throw allAnswersError;

  const topicsCovered = Array.from(new Set((allSessions ?? []).map((s) => s.topic).filter(Boolean))) as string[];
  const scores = (allAnswers ?? []).map((a) => a.score as number);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const streakDays = calculateStreak((allSessions ?? []).map((s) => s.created_at));
  const totalSessions = allSessions?.length ?? 0;

  const totalScore = Math.floor(
    totalSessions * 10 +
    streakDays * 20 +
    (averageScore ?? 0) * 50 +
    topicsCovered.length * 30
  );

  return {
    totalSessions,
    topicsCovered,
    recentSessions: recentSessions ?? [],
    averageScore,
    streakDays,
    totalScore,
  };
}

export function useDashboardData() {
  const { data, isLoading, error } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardData,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : error ? "Lỗi tải dữ liệu." : null,
  };
}