import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, question, userAnswer } = await req.json();

  if (!userAnswer || userAnswer.trim().length < 10) {
    return NextResponse.json(
      { error: "Câu trả lời quá ngắn, hãy viết chi tiết hơn." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior engineer có 10+ năm kinh nghiệm, đang phỏng vấn ứng viên về chủ đề "${topic}".
Nhiệm vụ: đọc câu hỏi và câu trả lời của ứng viên, sau đó đưa ra feedback.

Nguyên tắc:
- Trả lời bằng tiếng Việt, rõ ràng, không dùng buzzword
- Luôn chỉ ra cả điểm mạnh lẫn điểm cần cải thiện, không chỉ chê
- Nếu topic thuộc nhóm Behavioral, đánh giá theo framework STAR
- Nếu câu trả lời quá ngắn hoặc lạc đề, vẫn chấm điểm thấp và nêu rõ lý do thay vì bỏ qua

QUAN TRỌNG: Chỉ dùng tiếng Việt thuần và tiếng Anh cho thuật ngữ kỹ thuật. Tuyệt đối không dùng chữ Hán hoặc ngôn ngữ khác.

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác, không markdown:
{
  "strengths": "những gì câu trả lời đã đúng và đủ",
  "gaps": "những khái niệm chưa đề cập hoặc giải thích chưa rõ",
  "improvements": "gợi ý cách trả lời tốt hơn, kèm ví dụ cụ thể",
  "score": <số nguyên 1-10>
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
        {
          role: "user",
          content: `Câu hỏi: ${question}\n\nCâu trả lời của ứng viên: ${userAnswer}`,
        },
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