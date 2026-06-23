"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Topic = {
  id: string;
  name: string;
  questionCount: number;
};

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("topics")
          .select(`
            id,
            name,
            categories (
              question_bank (id)
            )
          `)
          .order("display_order");

        if (fetchError) throw fetchError;

        const mapped = (data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          questionCount: t.categories?.reduce(
            (sum: number, c: { question_bank: { id: string }[] }) =>
              sum + (c.question_bank?.length ?? 0),
            0
          ) ?? 0,
        }));

        setTopics(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải danh sách topic.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopics();
  }, []);

  return { topics, isLoading, error };
}