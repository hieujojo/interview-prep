"use client";

import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentCard } from "./DocumentCard";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { AIRecommendationModal } from "./AIRecommendationModal";

const DIFFICULTIES = ["Cơ bản", "Trung bình", "Nâng cao"];

export function DocumentsView() {
  const {
    documents, isLoading, error,
    filters, updateFilter, resetFilters,
    page, setPage, totalPages, total,
    topics, categories,
    refetch, getSignedUrl,
  } = useDocuments();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const hasActiveFilters =
    filters.search ||
    filters.topicId ||
    filters.categoryId ||
    filters.difficulty ||
    filters.fileType;

  const handleDownload = async (docId: string) => {
    setDownloadingId(docId);
    try {
      const url = await getSignedUrl(docId);
      if (url) {
        window.open(url, "_blank");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text mb-1">
            📚 Tài Liệu Học Tập
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Kho tài liệu PDF &amp; DOCX phân loại theo chủ đề và độ khó
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: "rgba(139,92,246,0.15)",
              color: "var(--primary-light)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            🤖 Gợi ý AI
          </button>
          <button
            id="upload-doc-btn"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold btn-gradient"
          >
            📤 Upload
          </button>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div
        className="rounded-2xl p-4 mb-6 flex flex-col gap-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Search bar */}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            🔍
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          {/* Topic filter */}
          <select
            value={filters.topicId}
            onChange={(e) => updateFilter("topicId", e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              background: filters.topicId ? "rgba(139,92,246,0.15)" : "var(--surface-2)",
              border: `1px solid ${filters.topicId ? "rgba(139,92,246,0.3)" : "var(--border)"}`,
              color: filters.topicId ? "var(--primary-light)" : "var(--muted)",
            }}
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              background: filters.categoryId ? "rgba(96,165,250,0.12)" : "var(--surface-2)",
              border: `1px solid ${filters.categoryId ? "rgba(96,165,250,0.25)" : "var(--border)"}`,
              color: filters.categoryId ? "var(--info)" : "var(--muted)",
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories
              .filter((c) => !filters.topicId || c.topic_id === filters.topicId)
              .map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              background: filters.difficulty ? "rgba(251,191,36,0.1)" : "var(--surface-2)",
              border: `1px solid ${filters.difficulty ? "rgba(251,191,36,0.2)" : "var(--border)"}`,
              color: filters.difficulty ? "var(--warning)" : "var(--muted)",
            }}
          >
            <option value="">Mọi độ khó</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* File type filter */}
          <div className="flex gap-1">
            {["pdf", "docx"].map((ft) => (
              <button
                key={ft}
                onClick={() => updateFilter("fileType", filters.fileType === ft ? "" : ft)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all uppercase"
                style={{
                  background: filters.fileType === ft ? "rgba(139,92,246,0.15)" : "var(--surface-2)",
                  color: filters.fileType === ft ? "var(--primary-light)" : "var(--muted)",
                  border: `1px solid ${filters.fileType === ft ? "rgba(139,92,246,0.3)" : "var(--border)"}`,
                }}
              >
                {ft === "pdf" ? "📄" : "📝"} {ft}
              </button>
            ))}
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ color: "var(--danger)", background: "var(--danger-bg)", border: "1px solid rgba(248,113,113,0.2)" }}
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── Result info ── */}
      {!isLoading && !error && (
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          {total > 0 ? `Hiển thị ${documents.length} / ${total} tài liệu` : ""}
        </p>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-44" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && documents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            {hasActiveFilters ? "Không tìm thấy tài liệu phù hợp" : "Chưa có tài liệu nào"}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {hasActiveFilters
              ? "Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác"
              : "Nhấn \"Upload\" để thêm tài liệu đầu tiên!"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold btn-gradient"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* ── Document grid ── */}
      {!isLoading && !error && documents.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDownload={handleDownload}
                isDownloading={downloadingId === doc.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                ← Trước
              </button>
              <span className="text-sm px-2" style={{ color: "var(--muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <DocumentUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={refetch}
        topics={topics}
        categories={categories}
      />
      <AIRecommendationModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        onDownload={handleDownload}
        isDownloading={downloadingId !== null}
      />
    </div>
  );
}
