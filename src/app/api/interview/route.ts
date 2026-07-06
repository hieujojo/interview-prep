import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { callAI, AIDisabledError } from "@/lib/aiClient";
import type { AIProvider } from "@/lib/aiProviders";
import { checkRateLimit } from "@/lib/rateLimit";

function isValidCategoryScore(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rate = checkRateLimit(user.id, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const { topic, question, userAnswer, provider = "groq" } = await req.json();

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "Thiếu topic." }, { status: 400 });
  }
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Thiếu question." }, { status: 400 });
  }
  if (!userAnswer || userAnswer.trim().length < 10) {
    return NextResponse.json(
      { error: "Câu trả lời quá ngắn, hãy viết chi tiết hơn." },
      { status: 400 }
    );
  }
  const aiProvider = provider as AIProvider;

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

QUY TẮC VIẾT FEEDBACK:
- "strengths": chỉ liệt kê những gì ứng viên THỰC SỰ đã nói đúng, không tự thêm.
- "gaps":  CHỈ liệt kê những gì câu hỏi YÊU CẦU mà ứng viên bỏ sót.
  KHÔNG thêm kiến thức liên quan nhưng nằm ngoài phạm vi câu hỏi vào gaps.
  Ví dụ: câu hỏi về branch → không phạt vì không đề cập git merge hay pull request workflow.
- "improvements": gợi ý cải thiện ngắn gọn bằng lời, KHÔNG kèm code hay ví dụ cụ thể.
- "example": viết một câu trả lời mẫu hoàn chỉnh cho câu hỏi này. Nếu cần minh họa bằng code, hãy viết code snippet ngắn gọn, rõ ràng. Đây là ô riêng biệt, tách hoàn toàn khỏi improvements.
- Trả lời bằng tiếng Việt, chỉ dùng tiếng Anh cho thuật ngữ kỹ thuật.

GIỚI HẠN ĐỘ DÀI (bắt buộc — đây KHÔNG phải bài giảng lý thuyết, mà là feedback ngắn gọn):
- "strengths": tối đa 4 gạch đầu dòng, mỗi dòng 1 câu ngắn nêu ĐÚNG cái ứng viên đã nói, KHÔNG giải thích lại lý thuyết.
- "gaps": nếu câu hỏi có nhiều khái niệm con (ví dụ 4 tính chất OOP) mà ứng viên bỏ sót/sai nhiều khái niệm, với MỖI khái niệm thiếu chỉ viết ĐÚNG 1 câu ngắn nêu thiếu cái gì — TUYỆT ĐỐI không viết lại định nghĩa đầy đủ, không kèm ví dụ, không kèm code cho từng khái niệm ở đây. Tối đa 5-6 gạch đầu dòng tổng cộng.
- "improvements": tối đa 3-4 câu ngắn, gợi ý hướng chung, không liệt kê lại từng khái niệm một, không có code.
- "example": đây là field DUY NHẤT được phép viết chi tiết. Nếu câu hỏi có nhiều khái niệm con, viết gọn mỗi khái niệm 1 định nghĩa ngắn (1-2 câu), rồi gộp minh họa bằng 1-2 code block tổng hợp — KHÔNG lặp lại 1 code block riêng cho từng khái niệm nếu không thực sự cần thiết để phân biệt hành vi.
- Nếu câu hỏi yêu cầu SO SÁNH nhiều kỹ thuật/phương án (ví dụ: 2 cách phân trang, 2 pattern...), chỉ viết code minh họa ĐẦY ĐỦ cho kỹ thuật liên quan trực tiếp đến câu trả lời của ứng viên (hoặc kỹ thuật phù hợp nhất nếu ứng viên không chọn cụ thể). Các kỹ thuật còn lại chỉ nêu tên và 1 câu khác biệt chính, KHÔNG viết code riêng cho từng kỹ thuật. Không thêm các mục tối ưu phụ (caching, lazy loading, compression...) trừ khi câu hỏi hỏi trực tiếp về việc đó.
- Nếu vi phạm giới hạn trên (viết dài, lặp lại lý thuyết, liệt kê quá chi tiết cho từng ý nhỏ), coi như feedback không đạt yêu cầu.

QUY TẮC ĐỊNH DẠNG VĂN BẢN (bắt buộc, áp dụng cho MỌI field dạng text - strengths, gaps, improvements, example):
Các field này sẽ được một markdown renderer hiển thị lại, nên phải tuân thủ đúng cú pháp sau, KHÔNG được viết dồn nhiều ý trên cùng một dòng.

1. Khi liệt kê từ 2 ý trở lên, PHẢI xuống dòng thật (\\n) giữa mỗi ý — tuyệt đối không viết kiểu "1. Ý một 2. Ý hai 3. Ý ba" liền trên một dòng.
   - Danh sách có thứ tự: mỗi mục là "1. Nội dung", "2. Nội dung"... mỗi số một dòng riêng, phân cách bằng \\n\\n hoặc \\n.
   - Danh sách không thứ tự: mỗi mục bắt đầu bằng "- Nội dung", mỗi mục một dòng riêng.
2. Tiêu đề phụ (nếu cần chia nhóm trong một field dài) viết dạng "**Tiêu đề:**" nằm riêng một dòng, KHÔNG bôi đậm cả đoạn văn hay cả câu dài.
3. Chỉ bôi đậm (**...**) đúng 1-3 từ khóa quan trọng mỗi ý, không bôi đậm nguyên câu.
4. Nếu có code, PHẢI bọc trong fenced code block đúng cú pháp: ba dấu backtick, tên ngôn ngữ, xuống dòng, code, xuống dòng, ba dấu backtick (ví dụ: bọc bằng \`\`\`jsx ... \`\`\`). KHÔNG viết code lẫn vào giữa câu văn xuôi mà không có fence.
5. Nếu cần so sánh dạng bảng, dùng đúng cú pháp markdown table (mỗi hàng một dòng riêng, có dòng phân cách |---|---|), không gộp các hàng vào một dòng.
6. Câu văn ngắn gọn, mỗi câu tối đa 1-2 ý, tránh câu ghép quá dài nhiều mệnh đề.
7. Nhớ rằng nội dung nằm trong JSON string, nên xuống dòng phải escape đúng chuẩn JSON (\\n), không được để line break thật làm vỡ JSON.

Trả lời CHỈ bằng JSON theo đúng format:
{
  "strengths": "những gì câu trả lời đã đúng và đủ",
  "gaps": "những khái niệm chưa đề cập hoặc giải thích chưa rõ",
  "improvements": "gợi ý cách trả lời tốt hơn bằng lời, không có code",
  "example": "câu trả lời mẫu hoàn chỉnh, có thể kèm code snippet nếu phù hợp",
  "categoryScores": {
    "technical": <số nguyên 0-10>,
    "problemSolving": <số nguyên 0-10>,
    "communication": <số nguyên 0-10>,
    "bestPractices": <số nguyên 0-10>
  }
}`;

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Câu hỏi: ${question}\n\nCâu trả lời của ứng viên: ${userAnswer}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    let parsed;
    try {
      const cleanContent = result.content.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      console.error("AI review: failed to parse JSON. Raw content:", result.content);
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    // Điểm tổng KHÔNG bao giờ lấy từ AI tự tính — luôn tính lại từ categoryScores
    // theo công thức cố định để đảm bảo tính nhất quán và chính xác tuyệt đối.
    const cs = parsed.categoryScores;
    if (
      !cs ||
      !isValidCategoryScore(cs.technical) ||
      !isValidCategoryScore(cs.problemSolving) ||
      !isValidCategoryScore(cs.communication) ||
      !isValidCategoryScore(cs.bestPractices)
    ) {
      console.error("AI review: invalid categoryScores:", cs);
      return NextResponse.json(
        { error: "AI trả về điểm không hợp lệ, vui lòng thử lại." },
        { status: 500 }
      );
    }

    const score = Math.max(
      1,
      Math.round(
        cs.technical * 0.4 +
        cs.problemSolving * 0.25 +
        cs.communication * 0.2 +
        cs.bestPractices * 0.15
      )
    );

    return NextResponse.json({
      ...parsed,
      score,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI." }, { status: 500 });
  }
}