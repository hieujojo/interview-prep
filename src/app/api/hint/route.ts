import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

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
          { role: "user", content: `Câu hỏi: ${question}` },
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

    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}
