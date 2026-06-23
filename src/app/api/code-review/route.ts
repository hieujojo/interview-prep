import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { language, context, code } = await req.json();

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

QUAN TRỌNG: Chỉ dùng tiếng Việt thuần và tiếng Anh cho thuật ngữ kỹ thuật. Tuyệt đối không dùng chữ Hán hoặc ngôn ngữ khác.

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

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Code cần review:\n\n${code}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json({ error: `AI API lỗi: ${errText}` }, { status: 500 });
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? "{}";

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
  }

  return NextResponse.json(parsed);
}