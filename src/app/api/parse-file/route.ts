import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // pdf-parse@1.1.1 - CommonJS, default export là function
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json(
        { error: "Định dạng file không hỗ trợ. Chỉ hỗ trợ .pdf và .docx" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Parse file error:", error);
    return NextResponse.json({ error: error.message || "Lỗi xử lý file" }, { status: 500 });
  }
}