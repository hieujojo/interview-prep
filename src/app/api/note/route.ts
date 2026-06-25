// app/api/note/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json({ error: "Thiếu câu hỏi." }, { status: 400 });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Bạn là senior engineer. Với câu hỏi phỏng vấn kỹ thuật được cung cấp, hãy trả về ĐÚNG 4-5 keyword/khái niệm nền tảng mà ứng viên CẦN ĐỀ CẬP khi trả lời câu hỏi đó. 
          
Yêu cầu:
- Keyword phải TRỰC TIẾP liên quan đến câu hỏi, không chung chung
- Ví dụ: câu hỏi về "tách component" → ["single responsibility", "reusability", "props drilling", "composition"]
- Ví dụ: câu hỏi về "Virtual DOM" → ["diffing algorithm", "reconciliation", "fiber", "batch update"]
- TUYỆT ĐỐI không trả về keyword chung như "hooks", "lifecycle" nếu câu hỏi không hỏi về chúng

Trả về CHỈ JSON:
{ "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"] }`
        },
        { role: "user", content: question }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI API lỗi." }, { status: 500 });
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  
  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Parse lỗi." }, { status: 500 });
  }
}