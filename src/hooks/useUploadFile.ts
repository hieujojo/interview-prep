// hooks/useUploadFile.ts
import { useState, useRef } from "react";

export const useUploadFile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (
    file: File,
    onSuccess: (text: string) => void,
    onError: (error: string) => void
  ) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lỗi đọc file");
      
      onSuccess(data.text);
    } catch (err: any) {
      onError(err.message || "Có lỗi xảy ra khi upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    isUploading,
    fileInputRef,
    uploadFile,
    triggerUpload,
  };
};