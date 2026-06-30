import { NextRequest, NextResponse } from "next/server";
import { callAI, AIDisabledError } from "@/lib/aiClient";
import type { AIProvider } from "@/lib/aiProviders";

export async function POST(req: NextRequest) {
  const { question, provider = "groq" } = await req.json();
  const aiProvider = provider as AIProvider;

  if (!question) {
    return NextResponse.json({ error: "Thiếu câu hỏi" }, { status: 400 });
  }

  const systemPrompt = `Bạn là một senior engineer. Ứng viên đang bị bí ý tưởng khi trả lời câu hỏi phỏng vấn.
Nhiệm vụ của bạn là đưa ra MỘT gợi ý ngắn gọn (không quá 2 câu) để giúp ứng viên nhớ ra hướng trả lời, TUYỆT ĐỐI không trả lời hộ toàn bộ câu hỏi.
Ví dụ:
Câu hỏi: "Sự khác biệt giữa useMemo và useCallback là gì?"
Gợi ý của bạn: "Hãy nhớ lại xem cái nào dùng để cache giá trị (value), cái nào dùng để cache hàm (function) nhé."

Trả lời bằng JSON theo đúng format sau:
{
  "hint": "nội dung gợi ý"
}`;

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Câu hỏi: ${question}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const cleanContent = result.content.replace(/```(?:json)?\\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    return NextResponse.json({
      ...parsed,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}
