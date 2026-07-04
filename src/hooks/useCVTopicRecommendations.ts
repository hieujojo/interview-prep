"use client";

import { useMemo } from "react";
import type { CVAnalysisResult } from "@/hooks/useCVAnalysis";
import type { Topic } from "@/hooks/useTopics";

// ── Types ──────────────────────────────────────────────────────────────────

export type RecommendedTopic = {
  topicName: string;
  /** Category names within this topic that are recommended */
  categories: string[];
  /** Short explanation shown to the user */
  reason: string;
  /** true = topic is above current level (Challenge tier) */
  isChallenge: boolean;
};

// ── Level ordering ─────────────────────────────────────────────────────────

const LEVEL_ORDER = ["Intern", "Fresher", "Junior", "Middle", "Senior"] as const;
type Level = (typeof LEVEL_ORDER)[number];

/**
 * Topics considered appropriate per level bucket.
 * Used when we cannot match a topic directly from CV skills/recommendations.
 * Keys are substrings matched against topic.name (lowercase).
 */
const CHALLENGE_TOPIC_KEYWORDS_BY_LEVEL: Record<Level, string[]> = {
  Intern:  ["docker", "ci/cd", "redis", "kubernetes", "system design", "microservice"],
  Fresher: ["docker", "ci/cd", "redis", "kubernetes", "system design", "microservice"],
  Junior:  ["kubernetes", "system design", "microservice", "redis"],
  Middle:  ["kubernetes", "microservice"],
  Senior:  [],
};

// ── Helper ─────────────────────────────────────────────────────────────────

function normalize(str: string) {
  return str.toLowerCase().trim();
}

/** Loose matching: a matches b if one is a substring of the other */
function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  return na.includes(nb) || nb.includes(na);
}

function isChallengeKeyword(topicName: string, level: Level): boolean {
  const keywords = CHALLENGE_TOPIC_KEYWORDS_BY_LEVEL[level] ?? [];
  return keywords.some((kw) => normalize(topicName).includes(kw));
}

// ── Main hook ──────────────────────────────────────────────────────────────

/**
 * Derives personalized topic/category recommendations from CV analysis.
 *
 * Logic:
 * 1. From `learningRecommendations` — direct skill→topic match, reason comes from the recommendation.
 * 2. From `skills.technical` — topics already in the candidate's skill set (great for practice).
 * 3. Challenge topics — topics that are above current level, flagged accordingly.
 *
 * Topics are de-duplicated; the first match wins.
 */
export function useCVTopicRecommendations(
  cvResult: CVAnalysisResult | null,
  topics: Topic[]
): {
  recommended: RecommendedTopic[];
  challenge: RecommendedTopic[];
  hasCV: boolean;
} {
  const result = useMemo(() => {
    if (!cvResult || topics.length === 0) {
      return { recommended: [], challenge: [], hasCV: false };
    }

    const currentLevel = (cvResult.currentLevel ?? "Fresher") as Level;
    const seen = new Set<string>();
    const recommended: RecommendedTopic[] = [];
    const challenge: RecommendedTopic[] = [];

    // ── Pass 1: from learningRecommendations ────────────────────────────
    for (const rec of cvResult.learningRecommendations ?? []) {
      const matchedTopic = topics.find((t) => fuzzyMatch(t.name, rec.skill));
      if (!matchedTopic || seen.has(matchedTopic.name)) continue;

      seen.add(matchedTopic.name);

      const isChallenge = isChallengeKeyword(matchedTopic.name, currentLevel);
      const entry: RecommendedTopic = {
        topicName: matchedTopic.name,
        categories: matchedTopic.categories.map((c) => c.name),
        reason: rec.reason,
        isChallenge,
      };

      if (isChallenge) {
        challenge.push(entry);
      } else {
        recommended.push(entry);
      }
    }

    // ── Pass 2: from skills.technical ───────────────────────────────────
    for (const skill of cvResult.skills?.technical ?? []) {
      const matchedTopic = topics.find((t) => fuzzyMatch(t.name, skill));
      if (!matchedTopic || seen.has(matchedTopic.name)) continue;

      seen.add(matchedTopic.name);

      const isChallenge = isChallengeKeyword(matchedTopic.name, currentLevel);
      const entry: RecommendedTopic = {
        topicName: matchedTopic.name,
        categories: matchedTopic.categories.map((c) => c.name),
        reason: `Bạn đã có kinh nghiệm với ${matchedTopic.name} — đây là topic phù hợp để ôn luyện thêm.`,
        isChallenge,
      };

      if (isChallenge) {
        challenge.push(entry);
      } else {
        recommended.push(entry);
      }
    }

    // ── Pass 3: challenge topics not yet added ───────────────────────────
    for (const topic of topics) {
      if (seen.has(topic.name)) continue;
      if (!isChallengeKeyword(topic.name, currentLevel)) continue;

      seen.add(topic.name);
      challenge.push({
        topicName: topic.name,
        categories: topic.categories.map((c) => c.name),
        reason: `Topic nâng cao — thử thách bản thân vượt qua giới hạn level ${currentLevel}.`,
        isChallenge: true,
      });
    }

    return { recommended, challenge, hasCV: true };
  }, [cvResult, topics]);

  return result;
}
