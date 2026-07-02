"use client";

import { useState } from "react";

export type UploadDocumentPayload = {
  title: string;
  topicId: string;
  categoryId: string;
  difficulty: string;
};

export function useDocumentUpload(onSuccess?: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<"idle" | "uploading" | "saving" | "done">("idle");

  const upload = async (file: File, payload: UploadDocumentPayload) => {
    setIsUploading(true);
    setError(null);
    setProgress("uploading");

    try {
      console.log(`[Frontend] Bắt đầu upload file ${file.name}...`);
      
      // Step 1: Request Signed Upload URL from API
      console.log(`[Frontend] Đang gọi API lấy Signed Upload URL ...`);
      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      console.log(`[Frontend] API get signed url trả về status:`, uploadRes.status);

      let uploadData;
      try {
        uploadData = await uploadRes.json();
        console.log(`[Frontend] Dữ liệu Signed URL:`, uploadData);
      } catch (e) {
        console.error(`[Frontend] Lỗi khi parse JSON:`, e);
        if (!uploadRes.ok) {
          throw new Error(`Lỗi API: ${uploadRes.statusText || uploadRes.status}`);
        }
        throw new Error("Không thể đọc phản hồi từ server.");
      }

      if (!uploadRes.ok) {
        throw new Error(uploadData?.error ?? "Lỗi tạo Signed URL.");
      }

      // Step 2: Upload file directly to Supabase Storage using Signed URL
      console.log(`[Frontend] Đang upload trực tiếp lên Supabase qua Signed URL...`);
      const directUploadRes = await fetch(uploadData.signedUrl, {
        method: "PUT",
        headers: {
          // You do NOT need Authorization here because signedUrl already has the token in query params
          "Content-Type": file.type,
        },
        body: file,
      });

      console.log(`[Frontend] Upload trực tiếp trả về status:`, directUploadRes.status);
      if (!directUploadRes.ok) {
        let errText = await directUploadRes.text().catch(() => "");
        console.error(`[Frontend] Lỗi upload trực tiếp:`, errText);
        throw new Error("Lỗi tải file lên Supabase Storage trực tiếp.");
      }

      // Step 2: Save metadata to DB
      console.log(`[Frontend] Đang gọi API POST /api/documents lưu metadata...`);
      setProgress("saving");
      const metaRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          file_name: uploadData.fileName,
          file_type: uploadData.fileType,
          file_path: uploadData.filePath,
          topic_id: payload.topicId || null,
          category_id: payload.categoryId || null,
          difficulty: payload.difficulty || null,
        }),
      });
      
      console.log(`[Frontend] API metadata trả về status:`, metaRes.status);
      const metaData = await metaRes.json();
      console.log(`[Frontend] Dữ liệu từ API metadata:`, metaData);

      if (!metaRes.ok) {
        throw new Error(metaData.error ?? "Lỗi lưu thông tin tài liệu.");
      }

      console.log(`[Frontend] Upload hoàn tất thành công!`);
      setProgress("done");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra.");
      setProgress("idle");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setError(null);
    setProgress("idle");
  };

  return { upload, isUploading, error, progress, reset };
}
