"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Document = {
  id: string;
  title: string;
  file_name: string;
  file_type: "pdf" | "docx";
  difficulty: "Cơ bản" | "Trung bình" | "Nâng cao" | null;
  is_public: boolean;
  created_at: string;
  topic_id: string | null;
  category_id: string | null;
  topics: { name: string } | null;
  categories: { name: string } | null;
};

export type DocumentFilters = {
  search: string;
  topicId: string;
  categoryId: string;
  difficulty: string;
  fileType: string;
};

const DEFAULT_FILTERS: DocumentFilters = {
  search: "",
  topicId: "",
  categoryId: "",
  difficulty: "",
  fileType: "",
};

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter options from Supabase directly
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; topic_id: string }[]>([]);

  useEffect(() => {
    supabase.from("topics").select("id, name").order("name").then(({ data }) => {
      if (data) setTopics(data);
    });
    supabase.from("categories").select("id, name, topic_id").order("name").then(({ data }) => {
      if (data) setCategories(data as any);
    });
  }, []);

  const fetchDocuments = useCallback(async (currentFilters: DocumentFilters, currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(currentPage) });
      if (currentFilters.search) params.set("search", currentFilters.search);
      if (currentFilters.topicId) params.set("topic_id", currentFilters.topicId);
      if (currentFilters.categoryId) params.set("category_id", currentFilters.categoryId);
      if (currentFilters.difficulty) params.set("difficulty", currentFilters.difficulty);
      if (currentFilters.fileType) params.set("file_type", currentFilters.fileType);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Lỗi tải tài liệu.");

      setDocuments(data.documents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(filters, page);
  }, [filters, page, fetchDocuments]);

  const updateFilter = (key: keyof DocumentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const refetch = () => fetchDocuments(filters, page);

  const getSignedUrl = async (docId: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/documents/${docId}/signed-url`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.signedUrl ?? null;
    } catch {
      return null;
    }
  };

  return {
    documents,
    isLoading,
    error,
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    total,
    topics,
    categories,
    refetch,
    getSignedUrl,
  };
}
