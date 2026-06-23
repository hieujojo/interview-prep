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

export function useMistakeHistory() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMistakes() {
      setIsLoading(true);
      setError(null);

      try {
        // Lấy danh sách câu trả lời có điểm < 5 (có thể là câu sai hoặc kém)
        const { data, error: fetchError } = await supabase
          .from("answers")
          .select(`
            id,
            user_answer,
            ai_feedback,
            score,
            created_at,
            questions (
              content,
              category
            )
          `)
          .lt("score", 5)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        // Ép kiểu (type casting) dữ liệu do relationship
        const formattedMistakes: Mistake[] = (data ?? []).map((row: any) => ({
          id: row.id,
          question: row.questions?.content ?? "Không rõ câu hỏi",
          category: row.questions?.category ?? "Không rõ chủ đề",
          userAnswer: row.user_answer,
          aiFeedback: row.ai_feedback,
          score: row.score,
          createdAt: row.created_at,
        }));

        setMistakes(formattedMistakes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải lịch sử sai.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMistakes();
  }, []);

  return { mistakes, isLoading, error };
}
