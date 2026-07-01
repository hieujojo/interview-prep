"use client";

import { useState } from "react";
import { useAIProvider } from "@/hooks/useAIProvider";
import { AI_PROVIDERS, PROVIDER_ORDER, type AIProvider } from "@/lib/aiProviders";

export function AIProviderToggle() {
  const { currentProvider, changeProvider, isLoading, isFallbackActive, isAIDisabled } = useAIProvider();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <div className="h-8 w-24 rounded-lg bg-white/5 animate-pulse" />;
  }

  const currentConfig = AI_PROVIDERS[currentProvider];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isAIDisabled 
            ? "bg-red-500/10 text-red-500 border border-red-500/20"
            : isFallbackActive
            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
            : "hover:bg-white/5 text-gray-300 border border-transparent"
        }`}
        title={
          isAIDisabled 
            ? "Hệ thống AI hiện đang bảo trì" 
            : isFallbackActive 
            ? `Đã tự động chuyển sang ${currentConfig.name} do server quá tải` 
            : `Đang dùng ${currentConfig.name}`
        }
      >
        <span>{currentConfig.icon}</span>
        <span className="hidden sm:inline-block max-w-[80px] truncate">
          {currentConfig.name}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 z-50 shadow-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
          >
            <div className="px-3 py-2 border-b text-xs text-gray-400 font-medium" style={{ borderColor: "var(--border)" }}>
              Chọn mô hình AI
            </div>
            {PROVIDER_ORDER.map((key) => {
              const p = AI_PROVIDERS[key];
              const isActive = key === currentProvider;
              return (
                <button
                  key={key}
                  onClick={() => {
                    changeProvider(key);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium flex items-center justify-between transition-colors hover:bg-white/5"
                  style={{ color: isActive ? "var(--primary-light)" : "var(--foreground)" }}
                >
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
