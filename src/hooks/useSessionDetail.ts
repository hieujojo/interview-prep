"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type SessionDetail =
    | { type: "interview"; items: { question: string; userAnswer: string; aiFeedback: string | null; score: number | null }[] }
    | { type: "code_review"; language: string; codeInput: string; aiReview: string }
    | { type: "jd_analysis"; jdText: string; techStack: string[]; level: string; questionsJson: unknown }
    | null;

export function useSessionDetail(sessionId: string | null, type: string | null) {
    const [detail, setDetail] = useState<SessionDetail>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId || !type) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDetail(null);
        }
    }, [sessionId, type]);

    useEffect(() => {
        if (!sessionId || !type) return;

        async function fetchDetail() {
            setIsLoading(true);
            setError(null);

            try {
                if (type === "interview") {
                    const { data: questions, error: qError } = await supabase
                        .from("questions")
                        .select("id, content")
                        .eq("session_id", sessionId);

                    if (qError) throw qError;

                    const items = await Promise.all(
                        (questions ?? []).map(async (q) => {
                            const { data: answer } = await supabase
                                .from("answers")
                                .select("user_answer, ai_feedback, score")
                                .eq("question_id", q.id)
                                .maybeSingle();

                            return {
                                question: q.content,
                                userAnswer: answer?.user_answer ?? "",
                                aiFeedback: answer?.ai_feedback ?? null,
                                score: answer?.score ?? null,
                            };
                        })
                    );

                    setDetail({ type: "interview", items });
                } else if (type === "code_review") {
                    const { data, error: crError } = await supabase
                        .from("code_reviews")
                        .select("language, code_input, ai_review")
                        .eq("session_id", sessionId)
                        .maybeSingle();

                    if (crError) throw crError;
                    if (data) {
                        setDetail({
                            type: "code_review",
                            language: data.language,
                            codeInput: data.code_input,
                            aiReview: data.ai_review,
                        });
                    }
                } else if (type === "jd_analysis") {
                    const { data, error: jdError } = await supabase
                        .from("jd_analyses")
                        .select("jd_text, tech_stack, level, questions_json")
                        .eq("session_id", sessionId)
                        .maybeSingle();

                    if (jdError) throw jdError;
                    if (data) {
                        setDetail({
                            type: "jd_analysis",
                            jdText: data.jd_text,
                            techStack: data.tech_stack ?? [],
                            level: data.level,
                            questionsJson: data.questions_json,
                        });
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Lỗi tải chi tiết.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchDetail();
    }, [sessionId, type]);

    return { detail, isLoading, error };
}