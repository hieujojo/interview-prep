"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type HistorySession = {
  id: string;
  type: string;
  topic: string | null;
  created_at: string;
};

export function useHistoryData() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("sessions")
          .select("id, type, topic, created_at")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setSessions(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải lịch sử.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return { sessions, isLoading, error };
}