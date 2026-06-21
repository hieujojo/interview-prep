import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { jdText } = await req.json();

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Job Description quá ngắn, hãy paste đầy đủ nội dung." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior technical recruiter kiêm engineer, đọc Job Description và phân tích sâu để chuẩn bị bộ câu hỏi phỏng vấn.

Nguyên tắc:
- Tập trung vào những gì JD NHẤN MẠNH, không sinh câu hỏi chung chung
- Nếu JD đề cập 1 công nghệ nhiều lần/ở vị trí quan trọng → câu hỏi về công nghệ đó phải chiếm tỉ lệ cao hơn
- Câu hỏi behavioral dựa vào phần "culture/values" của JD nếu có, nếu JD không có thì dùng behavioral chung
- Mỗi câu hỏi phải có độ khó: "Cơ bản", "Trung bình", hoặc "Nâng cao"
- Sinh 15-20 câu hỏi tổng, chia 3 category: "Technical", "System Design", "Behavioral"
- Sinh 2-3 bài tập coding mini phù hợp với stack trong JD

QUAN TRỌNG: Chỉ dùng tiếng Việt thuần và tiếng Anh cho thuật ngữ kỹ thuật. Tuyệt đối không dùng chữ Hán hoặc ngôn ngữ khác.

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác, không markdown:
{
  "techStack": ["công nghệ 1", "công nghệ 2", ...],
  "level": "Junior" | "Mid" | "Senior",
  "levelReason": "lý do ước tính level này dựa vào yêu cầu kinh nghiệm trong JD",
  "focusSkills": ["kỹ năng trọng tâm 1", "kỹ năng trọng tâm 2", ...],
  "questions": [
    { "category": "Technical" | "System Design" | "Behavioral", "difficulty": "Cơ bản" | "Trung bình" | "Nâng cao", "content": "nội dung câu hỏi" }
  ],
  "exercises": [
    { "title": "tên bài tập", "description": "mô tả ngắn gọn", "language": "ngôn ngữ gợi ý" }
  ]
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
        { role: "user", content: `Job Description:\n\n${jdText}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
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