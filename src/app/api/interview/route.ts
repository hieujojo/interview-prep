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

BƯỚC 1 - PHÂN TÍCH CÂU TRẢ LỜI (làm trong đầu, không output):
Trước khi chấm điểm, hãy liệt kê tất cả các ý mà ứng viên đã đề cập, kể cả khi diễn đạt theo cách riêng. Sau đó đối chiếu với yêu cầu của câu hỏi.

NGUYÊN TẮC NHẬN DIỆN Ý ĐÚNG (bắt buộc):
- Nếu ứng viên nói "A dẫn đến B" và câu hỏi hỏi về mối quan hệ A-B → ghi nhận là đúng.
- Nếu cách diễn đạt khác nhưng bản chất kỹ thuật giống nhau → ghi nhận là đúng.
- Nếu ứng viên dùng ví dụ thực tế để minh họa một khái niệm → ghi nhận là đã đề cập khái niệm đó.
- CHỈ đánh dấu "chưa đề cập" khi ứng viên HOÀN TOÀN không nhắc đến, kể cả gián tiếp.
- CHỈ đánh dấu "sai" khi ứng viên nói điều ngược lại với sự thật kỹ thuật.
- KHÔNG phạt nếu ứng viên không dùng đúng thuật ngữ chính xác nhưng ý nghĩa đúng.

VÍ DỤ NHẬN DIỆN Ý ĐÚNG:
Câu hỏi: "finally có chạy khi có return trong try không?"
- "finally vẫn chạy nhưng tới return thì dừng lại" → ĐÚNG, ý là finally chạy trước khi return thực sự thoát
- "finally luôn chạy dù có return" → ĐÚNG
- "finally chạy sau return" → SAI về thứ tự nhưng ý hiểu finally vẫn chạy → ĐÚNG một phần
- Không đề cập gì đến return → mới tính là GAP

THANG ĐIỂM ĐÁNH GIÁ (bắt buộc tuân theo):
Chấm điểm theo 4 tiêu chí, mỗi tiêu chí 0-10:

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

QUY TẮC VIẾT FEEDBACK:
- "strengths": chỉ liệt kê những gì ứng viên THỰC SỰ đã nói đúng, không tự thêm.
- "gaps": chỉ liệt kê những gì ứng viên THỰC SỰ chưa đề cập hoặc sai. Nếu không có gap thực sự, ghi "Không có gap đáng kể."
- "improvements": gợi ý cụ thể, kèm ví dụ code hoặc câu trả lời mẫu ngắn gọn.
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