"use client";

import type { DashboardData } from "@/hooks/useDashboardData";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type Props = {
  data: DashboardData;
};

// ── Định nghĩa hệ thống thành tựu & level Overwatch-style ──

const RANKS = [
  { name: "Bronze", minScore: 0, icon: "🥉", color: "#cd7f32", border: "rgba(205, 127, 50, 0.5)" },
  { name: "Silver", minScore: 200, icon: "🥈", color: "#c0c0c0", border: "rgba(192, 192, 192, 0.5)" },
  { name: "Gold", minScore: 500, icon: "🥇", color: "#ffd700", border: "rgba(255, 215, 0, 0.5)" },
  { name: "Platinum", minScore: 1000, icon: "💠", color: "#e5e4e2", border: "rgba(229, 228, 226, 0.5)" },
  { name: "Diamond", minScore: 2000, icon: "💎", color: "#b9f2ff", border: "rgba(185, 242, 255, 0.5)" },
  { name: "Master", minScore: 3500, icon: "🔥", color: "#ff8c00", border: "rgba(255, 140, 0, 0.5)" },
  { name: "Grandmaster", minScore: 5000, icon: "⚡", color: "#ff4500", border: "rgba(255, 69, 0, 0.5)" },
];

const ACHIEVEMENTS = [
  { id: "first_blood", name: "First Blood", desc: "Hoàn thành buổi phỏng vấn đầu tiên", condition: (d: DashboardData) => d.totalSessions >= 1, icon: "🩸" },
  { id: "streak_3", name: "On Fire", desc: "Đạt streak 3 ngày liên tiếp", condition: (d: DashboardData) => d.streakDays >= 3, icon: "🔥" },
  { id: "streak_7", name: "Unstoppable", desc: "Đạt streak 7 ngày liên tiếp", condition: (d: DashboardData) => d.streakDays >= 7, icon: "🚀" },
  { id: "high_score", name: "Sharpshooter", desc: "Đạt điểm trung bình >= 8.0", condition: (d: DashboardData) => (d.averageScore ?? 0) >= 8.0, icon: "🎯" },
  { id: "multitasker", name: "Flex Player", desc: "Cover ít nhất 5 topic khác nhau", condition: (d: DashboardData) => d.topicsCovered.length >= 5, icon: "🤹" },
  { id: "veteran", name: "Veteran", desc: "Hoàn thành 50 buổi luyện tập", condition: (d: DashboardData) => d.totalSessions >= 50, icon: "🎖️" },
];

// Mapping các topic sang các role Overwatch-style
const TOPIC_ROLE_MAP: Record<string, string> = {
  "HTML": "Frontend",
  "CSS": "Frontend",
  "React": "Frontend",
  "Vue": "Frontend",
  "Javascript": "Frontend",
  "Typescript": "Frontend",
  "C#": "Backend",
  "Java": "Backend",
  "Python": "Backend",
  "Node.js": "Backend",
  "SQL": "Database",
  "MongoDB": "Database",
  "System Design": "Architecture",
  "Docker": "DevOps",
  "Kubernetes": "DevOps",
  "AWS": "DevOps",
  "CI/CD": "DevOps",
};

export default function AchievementsView({ data }: Props) {
  // Điểm tổng quát (Total Score - SR) được fetch/tính từ useDashboardData
  const totalScore = data.totalScore;

  // Xác định Rank hiện tại
  const currentRankIndex = [...RANKS].reverse().findIndex(r => totalScore >= r.minScore);
  const currentRank = currentRankIndex !== -1 ? [...RANKS].reverse()[currentRankIndex] : RANKS[0];
  const nextRank = currentRankIndex > 0 ? [...RANKS].reverse()[currentRankIndex - 1] : null;

  const progressToNextRank = nextRank 
    ? ((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100 
    : 100;

  // Tính toán dữ liệu Radar Chart (Skill Rating)
  const roleStats: Record<string, number> = {
    Frontend: 10, // Base value
    Backend: 10,
    Database: 10,
    Architecture: 10,
    DevOps: 10,
  };

  data.topicsCovered.forEach(topic => {
    const role = TOPIC_ROLE_MAP[topic] || "Frontend"; // Default to Frontend if not found
    if (roleStats[role] !== undefined) {
      roleStats[role] += 20; // Mỗi topic cover cộng 20 điểm cho role đó
    }
  });

  const radarData = Object.keys(roleStats).map(role => ({
    subject: role,
    A: roleStats[role],
    fullMark: 100,
  }));

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.condition(data));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.condition(data));

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ letterSpacing: "-0.03em", color: "var(--foreground)" }}
        >
          🏆 Career Profile
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Skill Rating & Thành tựu của bạn (Overwatch Style)
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {/* ── SR Card (Skill Rating) ── */}
        <div
          className="rounded-2xl p-8 text-center flex flex-col justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: `1px solid ${currentRank.border}`,
            boxShadow: `0 0 30px ${currentRank.border}`,
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
            Skill Rating (SR)
          </p>
          <div className="text-6xl mb-2 animate-float drop-shadow-2xl">{currentRank.icon}</div>
          <h2 className="text-4xl font-black mb-1" style={{ color: currentRank.color, textShadow: `0 0 10px ${currentRank.color}` }}>
            {totalScore}
          </h2>
          <p className="text-lg font-bold uppercase tracking-widest mb-6" style={{ color: currentRank.color }}>
            {currentRank.name}
          </p>

          {/* Rank Progress Bar */}
          {nextRank && (
            <div className="w-full mt-auto">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span style={{ color: currentRank.color }}>{currentRank.minScore} SR</span>
                <span style={{ color: nextRank.color }}>Next: {nextRank.minScore} SR</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressToNextRank}%`,
                    background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Radar Chart (Role Mastery) ── */}
        <div
          className="md:col-span-2 rounded-2xl p-6 relative overflow-hidden flex flex-col"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Role Mastery
          </p>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Stats"
                  dataKey="A"
                  stroke={currentRank.color}
                  fill={currentRank.color}
                  fillOpacity={0.4}
                  isAnimationActive={true}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Achievements List ── */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
          🎖️ Badges & Trophies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedAchievements.map((ach, i) => (
            <div
              key={ach.id}
              className="rounded-xl p-4 flex items-center gap-4 animate-fadeIn"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                boxShadow: "0 4px 15px rgba(251, 191, 36, 0.1)",
              }}
            >
              <div className="text-4xl filter drop-shadow-md">{ach.icon}</div>
              <div>
                <p className="text-sm font-bold text-warning">{ach.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--foreground-2)" }}>{ach.desc}</p>
              </div>
            </div>
          ))}

          {lockedAchievements.map((ach, i) => (
            <div
              key={ach.id}
              className="rounded-xl p-4 flex items-center gap-4 animate-fadeIn opacity-50 grayscale hover:grayscale-0 transition-all duration-300"
              style={{
                animationDelay: `${(unlockedAchievements.length + i) * 0.1}s`,
                background: "var(--surface-2)",
                border: "1px dashed var(--border-bright)",
              }}
            >
              <div className="text-4xl opacity-50">{ach.icon}</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>{ach.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-2)" }}>{ach.desc}</p>
                <p className="text-xs font-bold mt-1 tracking-widest uppercase" style={{ color: "var(--danger)" }}>Locked 🔒</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
