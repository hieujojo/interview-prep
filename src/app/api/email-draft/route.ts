import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { jdText, cvText, candidateName, recipientName, companyName } = await req.json();

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Job Description quá ngắn." }, { status: 400 });
  }

  const systemPrompt = `Bạn là một career coach người Việt chuyên giúp ứng viên IT viết email xin việc chuyên nghiệp, ấn tượng và phù hợp với từng vị trí cụ thể.

QUAN TRỌNG: Toàn bộ email phải bằng tiếng Việt có đầy đủ dấu và chuyên nghiệp. Giữ tiếng Anh cho thuật ngữ kỹ thuật.

Nguyên tắc viết email:
- Chủ đề (subject) ngắn gọn, hấp dẫn, đề cập vị trí và điểm nổi bật
- Mở đầu lịch sự, đề cập nguồn biết đến vị trí
- Thân email: nêu bật 2-3 điểm phù hợp nhất với JD, dùng số liệu cụ thể nếu có CV
- Kết thúc chuyên nghiệp với call-to-action rõ ràng
- Ký tên đầy đủ
- Độ dài vừa phải: không quá ngắn (<150 chữ) và không quá dài (>400 chữ)

Trả lời CHỈ bằng JSON theo đúng format sau:
{
  "subject": "tiêu đề email",
  "body": "nội dung email đầy đủ với xuống dòng bằng \\n",
  "tips": [
    "lời khuyên để cải thiện email này hoặc buổi phỏng vấn"
  ],
  "alternativeSubjects": ["tiêu đề thay thế 1", "tiêu đề thay thế 2"]
}`;

  const userContent = [
    `Job Description:\n${jdText}`,
    cvText ? `\nCV của ứng viên:\n${cvText}` : "",
    candidateName ? `\nTên ứng viên: ${candidateName}` : "",
    recipientName ? `\nTên người nhận: ${recipientName}` : "",
    companyName ? `\nTên công ty: ${companyName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 3000,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return NextResponse.json({ error: "AI API lỗi: " + errText }, { status: 500 });
  }

  const aiData = await aiResponse.json();
  const rawText = aiData.choices?.[0]?.message?.content ?? "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
  }

  return NextResponse.json(parsed);
}
