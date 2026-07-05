import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { callAI, AIDisabledError } from "@/lib/aiClient";
import type { AIProvider } from "@/lib/aiProviders";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rate = checkRateLimit(user.id, 3, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const { provider = "groq" } = await req.json();
  const aiProvider = provider as AIProvider;

  // 1. Lấy lịch sử phỏng vấn gần nhất của user (20 câu gần nhất)
  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_content, category, score, feedback, user_answer")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (answersError || !answers || answers.length === 0) {
    return NextResponse.json(
      { error: "Bạn chưa có lịch sử phỏng vấn. Hãy hoàn thành ít nhất một phiên phỏng vấn trước." },
      { status: 400 }
    );
  }

  // 2. Lấy danh sách documents hiện có (lấy tối đa 50 tài liệu)
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("id, title, file_type, difficulty, topics:topic_id(name), categories:category_id(name)")
    .eq("is_public", true)
    .limit(50);

  if (docsError) {
    return NextResponse.json({ error: "Không thể lấy danh sách tài liệu." }, { status: 500 });
  }

  if (!documents || documents.length === 0) {
    return NextResponse.json(
      { error: "Chưa có tài liệu nào trong hệ thống. Vui lòng quay lại sau." },
      { status: 400 }
    );
  }

  // 3. Chuẩn bị dữ liệu cho AI
  const weakAnswers = answers
    .filter((a) => (a.score ?? 10) < 6)
    .map((a) => ({
      category: a.category,
      question: a.question_content,
      score: a.score,
      gaps: (a.feedback as any)?.gaps ?? "",
    }));

  const allAnswersSummary = answers.map((a) => ({
    category: a.category,
    score: a.score ?? 0,
  }));

  const docsList = documents.map((d: any) => ({
    id: d.id,
    title: d.title,
    fileType: d.file_type,
    difficulty: d.difficulty,
    topic: d.topics?.name ?? null,
    category: d.categories?.name ?? null,
  }));

  const systemPrompt = `Bạn là một AI coach luyện phỏng vấn kỹ thuật. Nhiệm vụ của bạn là phân tích kết quả phỏng vấn và gợi ý tài liệu học tập phù hợp nhất.

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác:
{
  "weaknesses": ["điểm yếu 1 bằng tiếng Việt", "điểm yếu 2"],
  "recommendations": [
    {
      "documentId": "uuid của tài liệu",
      "reason": "lý do cụ thể tại sao nên đọc tài liệu này bằng tiếng Việt có dấu"
    }
  ]
}

Quy tắc:
- Chỉ gợi ý tối đa 5 tài liệu
- Ưu tiên tài liệu phù hợp với điểm yếu (câu trả lời có score < 6)
- Mỗi recommendation phải có documentId là UUID hợp lệ từ danh sách được cung cấp
- Nếu không có tài liệu phù hợp, trả về recommendations là mảng rỗng
- Viết bằng tiếng Việt có dấu`;

  const userMessage = `Lịch sử phỏng vấn của user (tóm tắt):
${JSON.stringify(allAnswersSummary, null, 2)}

Các câu trả lời yếu (score < 6):
${JSON.stringify(weakAnswers, null, 2)}

Danh sách tài liệu có sẵn:
${JSON.stringify(docsList, null, 2)}

Hãy phân tích và gợi ý tài liệu phù hợp nhất.`;

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    let parsed: any;
    try {
      const clean = result.content.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    // Map documentId back to full document info
    const recommendedDocs = (parsed.recommendations ?? [])
      .map((rec: { documentId: string; reason: string }) => {
        const doc = documents.find((d) => d.id === rec.documentId);
        if (!doc) return null;
        return { ...doc, reason: rec.reason };
      })
      .filter(Boolean);

    return NextResponse.json({
      weaknesses: parsed.weaknesses ?? [],
      recommendations: recommendedDocs,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI." }, { status: 500 });
  }
}
