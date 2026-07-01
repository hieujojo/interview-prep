// src/stores/aiProviderStore.ts
"use client";

import { create } from "zustand";
import type { AIProvider } from "@/lib/aiProviders";

interface AIProviderState {
  currentProvider: AIProvider;
  isFallbackActive: boolean;
  isAIDisabled: boolean;
  setProvider: (provider: AIProvider) => void;
  setFallbackActive: (value: boolean) => void;
  setAIDisabled: (value: boolean) => void;
  reset: () => void;
}

export const useAIProviderStore = create<AIProviderState>()((set) => ({
  currentProvider: "groq",
  isFallbackActive: false,
  isAIDisabled: false,

  setProvider: (provider) =>
    set({ currentProvider: provider, isFallbackActive: false, isAIDisabled: false }),

  setFallbackActive: (value) => set({ isFallbackActive: value }),

  setAIDisabled: (value) => set({ isAIDisabled: value }),

  reset: () =>
    set({ currentProvider: "groq", isFallbackActive: false, isAIDisabled: false }),
}));
