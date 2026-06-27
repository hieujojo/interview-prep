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

THANG ĐIỂM ĐÁNH GIÁ (bắt buộc tuân theo):
Chấm điểm theo 4 tiêu chí sau, mỗi tiêu chí cho điểm từ 0-10:

1. Technical Accuracy (Độ chính xác kỹ thuật) - trọng số 40%
   - 8-10: Đúng hoàn toàn, nắm vững khái niệm
   - 5-7: Đúng cơ bản nhưng thiếu chi tiết
   - 1-4: Có lỗi hoặc hiểu sai một phần
   - 0: Sai hoàn toàn hoặc không trả lời

2. Problem Solving (Tư duy giải quyết vấn đề) - trọng số 25%
   - 8-10: Phân tích rõ ràng, có hướng giải quyết cụ thể
   - 5-7: Có hướng đúng nhưng chưa sâu
   - 1-4: Hướng giải quyết mơ hồ
   - 0: Không thể hiện tư duy giải quyết vấn đề

3. Communication (Diễn đạt & trình bày) - trọng số 20%
   - 8-10: Rõ ràng, có cấu trúc, dễ hiểu
   - 5-7: Tương đối rõ nhưng chưa mạch lạc
   - 1-4: Khó hiểu, lộn xộn
   - 0: Không thể hiểu được

4. Best Practices (Kinh nghiệm thực tế & best practices) - trọng số 15%
   - 8-10: Đề cập best practices, kinh nghiệm thực tế
   - 5-7: Biết một số best practices cơ bản
   - 1-4: Ít hoặc không đề cập best practices
   - 0: Không biết best practices

Công thức tính điểm tổng:
score = round((technical * 0.4) + (problemSolving * 0.25) + (communication * 0.2) + (bestPractices * 0.15))

Nguyên tắc đánh giá:
- Đánh giá dựa trên ý nghĩa và kiến thức, không đánh giá dựa trên từ khóa bắt buộc.
- Nếu ứng viên diễn đạt cùng một ý bằng cách khác, phải ghi nhận là đúng.
- Chỉ đánh dấu "gap" khi ứng viên thực sự chưa đề cập hoặc hiểu sai.
- Nếu topic thuộc nhóm Behavioral, đánh giá theo framework STAR.
- Trả lời bằng tiếng Việt, chỉ dùng tiếng Anh cho thuật ngữ kỹ thuật.

Trả lời CHỈ bằng JSON theo đúng format:
{
  "strengths": "những gì câu trả lời đã đúng và đủ",
  "gaps": "những khái niệm chưa đề cập hoặc giải thích chưa rõ",
  "improvements": "gợi ý cách trả lời tốt hơn, kèm ví dụ cụ thể",
  "categoryScores": {
    "technical": <số nguyên 0-10>,
    "problemSolving": <số nguyên 0-10>,
    "communication": <số nguyên 0-10>,
    "bestPractices": <số nguyên 0-10>
  },
  "score": <số nguyên 1-10, tính theo công thức trên>
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