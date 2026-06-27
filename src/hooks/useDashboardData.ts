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

// Cache trong user_stats được coi là "còn mới" nếu được cập nhật trong khoảng thời gian này.
// Quá thời gian này, hook sẽ tính lại từ sessions/answers rồi ghi đè cache.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

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

function isCacheFresh(updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  const age = Date.now() - new Date(updatedAt).getTime();
  return age < CACHE_TTL_MS;
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
        // 0. Lấy user hiện tại đang đăng nhập
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const userId = userData?.user?.id;
        if (!userId) throw new Error("Không tìm thấy user đang đăng nhập.");

        // 1. Fetch 5 buổi gần nhất — luôn cần, luôn nhẹ, không cache
        const { data: recentSessions, error: recentError } = await supabase
          .from("sessions")
          .select("id, type, topic, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // 2. Thử đọc cache từ user_stats
        const { data: cached } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (cached && isCacheFresh(cached.updated_at)) {
          // Cache còn mới => dùng luôn, không tính lại
          setData({
            totalSessions: cached.total_sessions,
            topicsCovered: cached.topics_covered ?? [],
            recentSessions: recentSessions ?? [],
            averageScore: cached.average_score,
            streakDays: cached.streak_days,
            totalScore: cached.total_score,
          });
          return;
        }

        // 3. Cache cũ hoặc chưa có => tính tay từ sessions/answers
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

        setData({
          totalSessions,
          topicsCovered,
          recentSessions: recentSessions ?? [],
          averageScore,
          streakDays,
          totalScore,
        });

        // 4. Ghi lại cache cho lần load sau (không chặn UI, lỗi ghi cache thì bỏ qua)
        supabase
          .from("user_stats")
          .upsert(
            {
              user_id: userId,
              total_sessions: totalSessions,
              topics_covered: topicsCovered,
              average_score: averageScore,
              streak_days: streakDays,
              total_score: totalScore,
              last_session_date: (allSessions ?? []).length > 0
                ? new Date(Math.max(...(allSessions ?? []).map((s) => new Date(s.created_at).getTime())))
                    .toISOString()
                    .slice(0, 10)
                : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
          .then(({ error: upsertError }) => {
            if (upsertError) console.warn("Không ghi được cache user_stats:", upsertError);
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