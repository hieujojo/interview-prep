"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardData } from "@/hooks/useDashboardData";

// ── Định nghĩa hệ thống Rank (Overwatch-style) ──

export type Rank = {
  name: string;
  minScore: number;
  icon: string;
  color: string;
  border: string;
};

export const RANKS: Rank[] = [
  { name: "Bronze",      minScore: 0,    icon: "🥉", color: "#cd7f32", border: "rgba(205, 127, 50, 0.5)" },
  { name: "Silver",      minScore: 200,  icon: "🥈", color: "#c0c0c0", border: "rgba(192, 192, 192, 0.5)" },
  { name: "Gold",        minScore: 500,  icon: "🥇", color: "#ffd700", border: "rgba(255, 215, 0, 0.5)" },
  { name: "Platinum",    minScore: 1000, icon: "💠", color: "#e5e4e2", border: "rgba(229, 228, 226, 0.5)" },
  { name: "Diamond",     minScore: 2000, icon: "💎", color: "#b9f2ff", border: "rgba(185, 242, 255, 0.5)" },
  { name: "Master",      minScore: 3500, icon: "🔥", color: "#ff8c00", border: "rgba(255, 140, 0, 0.5)" },
  { name: "Grandmaster", minScore: 5000, icon: "⚡", color: "#ff4500", border: "rgba(255, 69, 0, 0.5)" },
];

// ── Định nghĩa Achievement (static metadata) ──

export type AchievementDef = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: (d: DashboardData) => boolean;
};

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_blood",
    name: "First Blood",
    desc: "Hoàn thành buổi phỏng vấn đầu tiên",
    icon: "🩸",
    condition: (d) => d.totalSessions >= 1,
  },
  {
    id: "streak_3",
    name: "On Fire",
    desc: "Đạt streak 3 ngày liên tiếp",
    icon: "🔥",
    condition: (d) => d.streakDays >= 3,
  },
  {
    id: "streak_7",
    name: "Unstoppable",
    desc: "Đạt streak 7 ngày liên tiếp",
    icon: "🚀",
    condition: (d) => d.streakDays >= 7,
  },
  {
    id: "high_score",
    name: "Sharpshooter",
    desc: "Đạt điểm trung bình >= 8.0",
    icon: "🎯",
    condition: (d) => (d.averageScore ?? 0) >= 8.0,
  },
  {
    id: "multitasker",
    name: "Flex Player",
    desc: "Cover ít nhất 5 topic khác nhau",
    icon: "🤹",
    condition: (d) => d.topicsCovered.length >= 5,
  },
  {
    id: "veteran",
    name: "Veteran",
    desc: "Hoàn thành 50 buổi luyện tập",
    icon: "🎖️",
    condition: (d) => d.totalSessions >= 50,
  },
];

// ── Topic → Role mapping cho Radar Chart ──

const TOPIC_ROLE_MAP: Record<string, string> = {
  "html": "Frontend",
  "css": "Frontend",
  "css and tailwindcss": "Frontend",
  "tailwindcss": "Frontend",
  "tailwind": "Frontend",
  "react": "Frontend",
  "vue": "Frontend",
  "javascript": "Frontend",
  "typescript": "Frontend",
  "next.js": "Frontend",
  "nextjs": "Frontend",
  "c#": "Backend",
  ".net": "Backend",
  "java": "Backend",
  "python": "Backend",
  "node.js": "Backend",
  "nodejs": "Backend",
  "sql": "Database",
  "mongodb": "Database",
  "postgresql": "Database",
  "postgres": "Database",
  "system design": "Architecture",
  "docker": "DevOps",
  "kubernetes": "DevOps",
  "aws": "DevOps",
  "ci/cd": "DevOps",
  "git": "DevOps",
};

function resolveRole(topic: string): string | null {
  return TOPIC_ROLE_MAP[topic.trim().toLowerCase()] ?? null;
}

// ── Types trả về từ hook ──

export type AchievementRow = {
  id: string;
  achievement_id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
};

export type RadarDataPoint = {
  subject: string;
  A: number;
  fullMark: number;
};

export type AchievementState = {
  currentRank: Rank;
  nextRank: Rank | null;
  progressToNextRank: number;
  unlockedAchievements: AchievementDef[];
  lockedAchievements: AchievementDef[];
  radarData: RadarDataPoint[];
  isLoading: boolean;
  error: string | null;
};

// ── Hook ──

export function useAchievement(data: DashboardData | null): AchievementState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tính rank từ totalScore
  const totalScore = data?.totalScore ?? 0;
  const ranksDesc = [...RANKS].reverse();
  const currentRankIdx = ranksDesc.findIndex((r) => totalScore >= r.minScore);
  const currentRank = currentRankIdx !== -1 ? ranksDesc[currentRankIdx] : RANKS[0];
  const nextRank = currentRankIdx > 0 ? ranksDesc[currentRankIdx - 1] : null;

  const progressToNextRank = nextRank
    ? Math.min(
        100,
        ((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100
      )
    : 100;

  // Tính achievements (unlock/locked) từ DashboardData
  const unlockedAchievements = data
    ? ACHIEVEMENT_DEFS.filter((a) => a.condition(data))
    : [];
  const lockedAchievements = data
    ? ACHIEVEMENT_DEFS.filter((a) => !a.condition(data))
    : ACHIEVEMENT_DEFS;

  // Tính Radar data
  const roleStats: Record<string, number> = {
    Frontend: 10,
    Backend: 10,
    Database: 10,
    Architecture: 10,
    DevOps: 10,
  };

  (data?.topicsCovered ?? []).forEach((topic) => {
    const role = resolveRole(topic);
    if (role && roleStats[role] !== undefined) {
      roleStats[role] += 20;
    }
  });

  const radarData: RadarDataPoint[] = Object.keys(roleStats).map((role) => ({
    subject: role,
    A: Math.min(roleStats[role], 100), // cap tại 100
    fullMark: 100,
  }));

  // Persist newly unlocked achievements lên bảng `achivement`
  useEffect(() => {
    if (!data || unlockedAchievements.length === 0) return;

    async function persistNewAchievements() {
      setIsLoading(true);
      setError(null);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData?.user?.id;
        if (!userId) return;

        // Đọc các achievement đã lưu trong DB
        const { data: existing, error: fetchError } = await supabase
          .from("achivement")
          .select("achievement_id")
          .eq("user_id", userId);
        if (fetchError) throw fetchError;

        const existingIds = new Set((existing ?? []).map((r) => r.achievement_id));

        // Chỉ insert những cái chưa có (UNIQUE constraint cũng bảo vệ, nhưng lọc sẵn cho sạch)
        const toInsert = unlockedAchievements
          .filter((a) => !existingIds.has(a.id))
          .map((a) => ({
            user_id: userId,
            achievement_id: a.id,
            name: a.name,
            description: a.desc,
            icon: a.icon,
          }));

        if (toInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("achivement")
            .insert(toInsert);
          if (insertError) throw insertError;
        }
      } catch (err) {
        // Lỗi persist không block UI, chỉ log warning
        console.warn("useAchievement: không ghi được achievements:", err);
        setError(err instanceof Error ? err.message : "Lỗi lưu achievement.");
      } finally {
        setIsLoading(false);
      }
    }

    persistNewAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.totalSessions, data?.streakDays, data?.averageScore, data?.topicsCovered.length]);

  return {
    currentRank,
    nextRank,
    progressToNextRank,
    unlockedAchievements,
    lockedAchievements,
    radarData,
    isLoading,
    error,
  };
}