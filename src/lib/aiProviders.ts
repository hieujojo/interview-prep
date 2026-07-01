// src/lib/aiProviders.ts
// Danh sach AI providers — de mo rong them provider moi

export type AIProvider = "groq" | "gemini";

export interface ProviderConfig {
  baseURL: string;
  apiKeyEnv: string;
  model: string;
  name: string;
  icon: string;
}

export const AI_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    model: "llama-3.3-70b-versatile",
    name: "Groq",
    icon: "⚡",
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKeyEnv: "GEMINI_API_KEY",
    model: "gemini-2.5-flash",
    name: "Gemini",
    icon: "✨",
  },
};

export const PROVIDER_ORDER: AIProvider[] = ["groq", "gemini"];

export function getFallbackProvider(current: AIProvider): AIProvider {
  const idx = PROVIDER_ORDER.indexOf(current);
  return PROVIDER_ORDER[(idx + 1) % PROVIDER_ORDER.length];
}
