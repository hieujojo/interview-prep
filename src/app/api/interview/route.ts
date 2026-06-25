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

Nguyên tắc đánh giá:

- Trả lời bằng tiếng Việt, rõ ràng, không dùng buzzword.
- Luôn chỉ ra cả điểm mạnh lẫn điểm cần cải thiện, không chỉ chê.
- Nếu topic thuộc nhóm Behavioral, đánh giá theo framework STAR.
- Nếu câu trả lời quá ngắn hoặc lạc đề, vẫn chấm điểm thấp và nêu rõ lý do.

QUY TẮC CHẤM ĐIỂM QUAN TRỌNG:
- Đánh giá dựa trên ý nghĩa và kiến thức mà ứng viên thể hiện, không đánh giá dựa trên từ khóa bắt buộc.
- Không yêu cầu ứng viên phải dùng đúng câu chữ hoặc đúng cấu trúc của câu trả lời mẫu.
- Nếu ứng viên diễn đạt cùng một ý bằng cách khác, phải ghi nhận là đúng.
- Không coi là thiếu kiến thức nếu ví dụ hoặc cách diễn đạt khác nhưng vẫn thể hiện đúng bản chất.
- Chỉ đánh dấu "gap" khi ứng viên thực sự chưa đề cập hoặc hiểu sai khái niệm.
- Không tự thêm yêu cầu ngoài phạm vi câu hỏi.

Ví dụ:
Nếu câu hỏi hỏi về khi nào nên dùng TypeScript:
- "Dự án cần bảo trì, scale lớn" 
- "Dự án nhiều người làm, cần giảm lỗi khi thay đổi code"
- "Dự án phức tạp, cần kiểm soát code tốt"

=> đều được xem là cùng một ý nghĩa.

Không được đánh giá:
"Dự án cần bảo trì và scale"
là thiếu chỉ vì không có đúng cụm:
"Không nên dùng khi không cần bảo trì và scale"

QUAN TRỌNG:
- Phân biệt giữa:
  + Thiếu chi tiết
  + Sai kiến thức
  + Diễn đạt khác nhưng đúng
- Không phạt nặng các câu trả lời ngắn nhưng đúng trọng tâm.

Chỉ dùng tiếng Việt thuần và tiếng Anh cho thuật ngữ kỹ thuật. Tuyệt đối không dùng chữ Hán hoặc ngôn ngữ khác.

Trả lời CHỈ bằng JSON theo đúng format:
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