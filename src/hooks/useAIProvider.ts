import { useEffect, useState, useCallback } from "react";
import { useAIProviderStore } from "@/stores/aiProviderStore";
import type { AIProvider } from "@/lib/aiProviders";

export function useAIProvider() {
  const { currentProvider, setProvider, isFallbackActive, isAIDisabled, reset } = useAIProviderStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProvider = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ai-provider");
      if (res.ok) {
        const data = await res.json();
        if (data.provider) {
          setProvider(data.provider as AIProvider);
        }
      }
    } catch (err) {
      console.error("Loi lay AI provider:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setProvider]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const changeProvider = async (newProvider: AIProvider) => {
    // Optimistic update
    setProvider(newProvider);
    
    try {
      await fetch("/api/ai-provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: newProvider }),
      });
    } catch (err) {
      console.error("Loi luu AI provider:", err);
      // Neu that bai co the revert, nhung hien tai optimistic update la du
    }
  };

  return {
    currentProvider,
    isFallbackActive,
    isAIDisabled,
    isLoading,
    changeProvider,
    reset,
  };
}
