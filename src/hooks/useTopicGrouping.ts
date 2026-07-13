import { useMemo } from "react";

/**
 * Minimal shape a topic needs to be groupable.
 * Kept intentionally loose so it structurally matches whatever
 * `Topic` type useTopics.ts already exports.
 */
export interface GroupableTopic {
  id: string;
  name: string;
  questionCount: number;
}

export type TopicGroupKey =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "soft-skill"
  | "other";

const GROUP_CONFIG: Record<TopicGroupKey, { label: string; icon: string; order: number }> = {
  frontend: { label: "Frontend", icon: "🎨", order: 1 },
  backend: { label: "Backend", icon: "⚙️", order: 2 },
  database: { label: "Database", icon: "🗄️", order: 3 },
  devops: { label: "DevOps & Tools", icon: "🛠️", order: 4 },
  "soft-skill": { label: "Kỹ năng mềm", icon: "🤝", order: 5 },
  other: { label: "Khác", icon: "📝", order: 6 },
};

/**
 * Thứ tự ưu tiên hiển thị trong từng group.
 * Topic match keyword nào thì dùng order đó. Số nhỏ hơn = hiển thị trước.
 * Lưu ý: "react native" phải kiểm tra TRƯỚC "react" để không bị nhầm.
 */
const TOPIC_ORDER: Array<{ keyword: string; order: number }> = [
  // Frontend
  { keyword: "html", order: 10 },
  { keyword: "css", order: 20 },
  { keyword: "tailwind", order: 25 },
  { keyword: "javascript", order: 30 },
  { keyword: "typescript", order: 40 },
  { keyword: "react native", order: 55 },
  { keyword: "react", order: 50 },
  { keyword: "next", order: 60 },
  { keyword: "vue", order: 70 },
  { keyword: "angular", order: 80 },
  // Backend
  { keyword: "c#", order: 10 },
  { keyword: ".net", order: 20 },
  { keyword: "node", order: 30 },
  { keyword: "java", order: 40 },
  { keyword: "python", order: 50 },
  { keyword: "golang", order: 60 },
  { keyword: "php", order: 70 },
  // Database
  { keyword: "sql", order: 10 },
  { keyword: "mongo", order: 20 },
  { keyword: "redis", order: 30 },
  // DevOps
  { keyword: "git", order: 10 },
  { keyword: "docker", order: 20 },
  { keyword: "kubernetes", order: 30 },
  { keyword: "ci/cd", order: 40 },
  { keyword: "aws", order: 50 },
];

function getTopicOrder(topicName: string): number {
  const name = topicName.toLowerCase();
  for (const { keyword, order } of TOPIC_ORDER) {
    if (name.includes(keyword)) return order;
  }
  return 999;
}

/**
 * Same matching philosophy as getTopicLogo() in InterviewView —
 * add new keywords here whenever a new topic/language is added
 * to the question bank, no UI change needed.
 */
function getTopicGroup(topicName: string): TopicGroupKey {
  const name = topicName.toLowerCase();

  if (
    name.includes("react") ||
    name.includes("html") ||
    name.includes("css") ||
    name.includes("tailwind") ||
    name.includes("typescript") ||
    name.includes("javascript") ||
    name.includes("next") ||
    name.includes("vue") ||
    name.includes("angular")
  ) {
    return "frontend";
  }

  if (
    name.includes("node") ||
    name.includes(".net") ||
    name.includes("c#") ||
    name.includes("asp") ||
    name.includes("java") ||
    name.includes("python") ||
    name.includes("golang") ||
    name.includes(" go ") ||
    name.includes("php")
  ) {
    return "backend";
  }

  if (name.includes("mongo") || name.includes("sql") || name.includes("redis") || name.includes("database")) {
    return "database";
  }

  if (name.includes("docker") || name.includes("git") || name.includes("kubernetes") || name.includes("ci/cd") || name.includes("aws")) {
    return "devops";
  }

  if (name.includes("kỹ năng mềm") || name.includes("soft skill")) {
    return "soft-skill";
  }

  return "other";
}

export interface TopicGroup<T> {
  key: TopicGroupKey;
  label: string;
  icon: string;
  topics: T[];
}

/**
 * Groups a flat topics array into labeled category buckets, sorted by
 * a fixed display order. Pure derived data — recomputed only when
 * `topics` reference changes.
 */
export function useTopicGrouping<T extends GroupableTopic>(topics: T[]): TopicGroup<T>[] {
  return useMemo(() => {
    const map = new Map<TopicGroupKey, T[]>();

    for (const topic of topics) {
      const key = getTopicGroup(topic.name);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(topic);
    }

    return Array.from(map.entries())
      .map(([key, groupTopics]) => ({
        key,
        label: GROUP_CONFIG[key].label,
        icon: GROUP_CONFIG[key].icon,
        topics: [...groupTopics].sort((a, b) => getTopicOrder(a.name) - getTopicOrder(b.name)),
      }))
      .sort((a, b) => GROUP_CONFIG[a.key].order - GROUP_CONFIG[b.key].order);
  }, [topics]);
}