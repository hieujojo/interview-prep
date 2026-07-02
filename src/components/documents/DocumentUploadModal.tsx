"use client";

import { useState, useRef } from "react";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topics: { id: string; name: string }[];
  categories: { id: string; name: string; topic_id: string }[];
};

export function DocumentUploadModal({ open, onClose, onSuccess, topics, categories }: Props) {
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, error, progress, reset } = useDocumentUpload(() => {
    onSuccess();
    handleClose();
  });

  const handleClose = () => {
    if (isUploading) return;
    setTitle("");
    setTopicId("");
    setCategoryId("");
    setDifficulty("");
    setSelectedFile(null);
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) return;
    await upload(selectedFile, { title: title.trim(), topicId, categoryId, difficulty });
  };

  const progressLabel = {
    idle: "",
    uploading: "Đang upload file...",
    saving: "Đang lưu thông tin...",
    done: "Hoàn thành!",
  }[progress];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 animate-scaleIn"
        style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
            📤 Upload Tài Liệu
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File picker */}
          <div
            className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors"
            style={{
              borderColor: selectedFile ? "var(--primary)" : "var(--border-bright)",
              background: selectedFile ? "rgba(139,92,246,0.05)" : "transparent",
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div>
                <p className="text-2xl mb-1">
                  {selectedFile.name.endsWith(".pdf") ? "📄" : "📝"}
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--primary-light)" }}>
                  {selectedFile.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📁</p>
                <p className="text-sm font-medium" style={{ color: "var(--foreground-2)" }}>
                  Chọn file PDF hoặc DOCX
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Tối đa 20MB
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
              Tiêu đề tài liệu *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Topic & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                Chủ đề
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: topicId ? "var(--foreground)" : "var(--muted)",
                }}
              >
                <option value="">Chọn chủ đề</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                Danh mục
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: categoryId ? "var(--foreground)" : "var(--muted)",
                }}
              >
                <option value="">Chọn danh mục</option>
                {categories
                  .filter((c) => !topicId || c.topic_id === topicId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
              Độ khó
            </label>
            <div className="flex gap-2">
              {["Cơ bản", "Trung bình", "Nâng cao"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(difficulty === d ? "" : d)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background:
                      difficulty === d ? "rgba(139,92,246,0.2)" : "var(--surface-2)",
                    color: difficulty === d ? "var(--primary-light)" : "var(--muted)",
                    border: `1px solid ${difficulty === d ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(139,92,246,0.1)", color: "var(--primary-light)" }}>
              <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              {progressLabel}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "var(--surface-2)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !title.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-gradient"
            >
              {isUploading ? "Đang xử lý..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
