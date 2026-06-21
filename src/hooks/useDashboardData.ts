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
};

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d).toDateString()))
  ).map((d) => new Date(d));

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
      // hôm nay chưa luyện nhưng hôm qua có -> vẫn tính streak đang chạy
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
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("id, type, topic, created_at")
          .order("created_at", { ascending: false });

        if (sessionsError) throw sessionsError;

        const { data: answers, error: answersError } = await supabase
          .from("answers")
          .select("score")
          .not("score", "is", null);

        if (answersError) throw answersError;

        const topicsCovered = Array.from(
          new Set((sessions ?? []).map((s) => s.topic).filter(Boolean))
        ) as string[];

        const scores = (answers ?? []).map((a) => a.score as number);
        const averageScore =
          scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

        const streakDays = calculateStreak((sessions ?? []).map((s) => s.created_at));

        setData({
          totalSessions: sessions?.length ?? 0,
          topicsCovered,
          recentSessions: (sessions ?? []).slice(0, 5),
          averageScore,
          streakDays,
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