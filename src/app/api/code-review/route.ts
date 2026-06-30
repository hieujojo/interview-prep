import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { callAI, AIDisabledError } from "@/lib/aiClient";
import type { AIProvider } from "@/lib/aiProviders";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { language, context, code, provider = "groq" } = await req.json();
  const aiProvider = provider as AIProvider;

  if (!code || code.trim().length < 5) {
    return NextResponse.json({ error: "Code quá ngắn để review." }, { status: 400 });
  }

  const systemPrompt = `Bạn là một senior engineer có 10+ năm kinh nghiệm, đang review code ngôn ngữ ${language}.
${context ? `Context do người dùng cung cấp: ${context}` : ""}

Nhiệm vụ: đọc đoạn code và đưa ra review chi tiết.

Nguyên tắc:
- Trả lời bằng tiếng Việt, rõ ràng, không dùng buzzword
- Chỉ ra cả điểm đã làm tốt lẫn vấn đề cần sửa
- Nếu không có lỗi/vấn đề ở mục nào, ghi rõ "Không phát hiện vấn đề" thay vì bịa ra
- KHÔNG tự chạy code, chỉ đọc và phân tích

QUAN TRỌNG: Chỉ dùng tiếng Việt thuần và tiếng Anh cho thuật ngữ kỹ thuật.

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác, không markdown:
{
  "syntaxErrors": "lỗi cú pháp nếu có, chỉ rõ dòng/đoạn",
  "logicErrors": "lỗi logic nếu có, trường hợp code chạy nhưng kết quả sai",
  "edgeCases": "các input đặc biệt chưa được xử lý (null, empty, overflow...)",
  "performance": "vòng lặp thừa, complexity cao, cách tối ưu",
  "bestPractices": "naming convention, clean code, code smell",
  "security": "lỗ hổng bảo mật nếu có (SQL injection, XSS, lộ thông tin nhạy cảm)",
  "improvedCode": "code đã được viết lại tốt hơn, kèm comment giải thích ngắn gọn"
}`;

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Code cần review:\n\n${code}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    let parsed;
    try {
      const cleanContent = result.content.replace(/```(?:json)?\\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    // Lưu kết quả code review vào DB
    try {
      await supabase.from("code_reviews").insert({
        user_id: user.id,
        language,
        code,
        context: context || null,
        result: parsed,
      });
    } catch {
      console.warn("Bỏ qua lỗi lưu code_reviews");
    }

    return NextResponse.json({
      ...parsed,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI." }, { status: 500 });
  }
}