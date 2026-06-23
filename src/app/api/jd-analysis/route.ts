import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { jdText } = await req.json();

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Job Description qua ngan, hay paste day du noi dung." },
      { status: 400 }
    );
  }

  const systemPrompt = `Ban la mot senior technical recruiter kiem engineer, doc Job Description va phan tich sau de chuan bi bo cau hoi phong van.

Nguyen tac:
- Tap trung vao nhung gi JD NHAN MANH, khong sinh cau hoi chung chung
- Neu JD de cap 1 cong nghe nhieu lan o vi tri quan trong -> cau hoi ve cong nghe do phai chiem ti le cao hon
- Cau hoi behavioral dua vao phan culture values cua JD neu co, neu JD khong co thi dung behavioral chung
- Moi cau hoi phai co do kho: Co ban, Trung binh, hoac Nang cao
- Sinh 15-20 cau hoi tong, chia 3 category: Technical, System Design, Behavioral
- Sinh 2-3 bai tap coding mini phu hop voi stack trong JD

Chi dung tieng Viet thuan va tieng Anh cho thuat ngu ky thuat.

Tra loi CHI bang JSON theo dung format sau, khong them text nao khac, khong markdown:
{
  "techStack": ["cong nghe 1", "cong nghe 2"],
  "level": "Junior",
  "levelReason": "ly do uoc tinh level",
  "focusSkills": ["ky nang 1", "ky nang 2"],
  "questions": [
    { "category": "Technical", "difficulty": "Co ban", "content": "noi dung cau hoi" }
  ],
  "exercises": [
    { "title": "ten bai tap", "description": "mo ta ngan gon", "language": "ngon ngu goi y" }
  ]
}`;

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
        { role: "user", content: "Job Description:\n\n" + jdText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return NextResponse.json({ error: "AI API loi: " + errText }, { status: 500 });
  }

  const aiData = await aiResponse.json();
  const rawText = aiData.choices?.[0]?.message?.content ?? "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Khong parse duoc phan hoi AI." }, { status: 500 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("jd_analyses")
    .insert({
      jd_text: jdText,
      tech_stack: parsed.techStack ?? [],
      level: parsed.level ?? null,
      questions_json: {
        levelReason: parsed.levelReason,
        focusSkills: parsed.focusSkills,
        questions: parsed.questions,
        exercises: parsed.exercises,
      },
    })
    .select("id")
    .single();

  if (saveError) {
    console.error("Loi luu jd_analyses:", JSON.stringify(saveError, null, 2));
  } else {
    console.log("Luu thanh cong jd_analyses id:", saved?.id);
  }

  return NextResponse.json({ ...parsed, savedId: saved?.id ?? null });
}
