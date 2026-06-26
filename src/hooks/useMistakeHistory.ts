import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Mistake = {
  id: string;
  question: string;
  category: string;
  userAnswer: string;
  aiFeedback: string;
  score: number;
  createdAt: string;
};

type UseMistakeHistoryReturn = {
  mistakes: Mistake[];
  isLoading: boolean;
  isEmpty: boolean;        // ← thêm mới
  error: string | null;
};

export function useMistakeHistory(): UseMistakeHistoryReturn {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMistakes() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("answers")
          .select(`
            id,
            user_answer,
            ai_feedback,
            score,
            created_at,
            question_content,
            category
          `)
          .lt("score", 5)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        // data có thể là null hoặc [] — đều được xử lý an toàn
        const rows = data ?? [];

        const formatted: Mistake[] = rows.map((row: any) => ({
          id: row.id,
          question: row.question_content ?? "Không rõ câu hỏi",
          category: row.category ?? "Không rõ chủ đề",
          userAnswer: row.user_answer,
          aiFeedback: row.ai_feedback,
          score: row.score,
          createdAt: row.created_at,
        }));

        setMistakes(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải lịch sử sai.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMistakes();
  }, []);

  return {
    mistakes,
    isLoading,
    isEmpty: !isLoading && mistakes.length === 0 && !error,  // ← rõ ràng
    error,
  };
}