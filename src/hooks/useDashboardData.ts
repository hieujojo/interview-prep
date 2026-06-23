"use client";

import { useEffect, useState } from "react";
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

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch 5 recent sessions (luôn nhẹ và nhanh)
        const { data: recentSessions, error: recentError } = await supabase
          .from("sessions")
          .select("id, type, topic, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // 2. Thử fetch dữ liệu tổng hợp từ bảng user_stats (cực nhanh)
        const { data: statsData, error: statsError } = await supabase
          .from("user_stats")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!statsError && statsData) {
          setData({
            totalSessions: statsData.total_sessions,
            topicsCovered: statsData.topics_covered,
            recentSessions: recentSessions ?? [],
            averageScore: statsData.average_score,
            streakDays: statsData.streak_days,
            totalScore: statsData.total_score,
          });
          return;
        }

        // 3. FALLBACK: Nếu bạn chưa chạy SQL tạo bảng user_stats, nó sẽ tự lùi về cách tính thủ công
        const { data: allSessions } = await supabase.from("sessions").select("topic, created_at");
        const { data: allAnswers } = await supabase.from("answers").select("score").not("score", "is", null);

        const topicsCovered = Array.from(new Set((allSessions ?? []).map((s) => s.topic).filter(Boolean))) as string[];
        const scores = (allAnswers ?? []).map((a) => a.score as number);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        const streakDays = calculateStreak((allSessions ?? []).map((s) => s.created_at));
        
        const totalScore = Math.floor(
          ((allSessions?.length ?? 0) * 10) + 
          (streakDays * 20) + 
          ((averageScore ?? 0) * 50) + 
          (topicsCovered.length * 30)
        );

        setData({
          totalSessions: allSessions?.length ?? 0,
          topicsCovered,
          recentSessions: recentSessions ?? [],
          averageScore,
          streakDays,
          totalScore,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}