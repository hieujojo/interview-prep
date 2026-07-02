import { DocumentsView } from "@/components/documents/DocumentsView";

export const metadata = {
  title: "Tài Liệu Học Tập | Interview Prep",
  description:
    "Kho tài liệu PDF và DOCX phân loại theo chủ đề, độ khó. AI gợi ý tài liệu phù hợp dựa trên lịch sử phỏng vấn của bạn.",
};

export default function DocumentsPage() {
  return <DocumentsView />;
}
