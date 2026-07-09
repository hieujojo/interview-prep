// src/lib/aiClient.ts
// Factory function goi AI voi fallback logic

import { AI_PROVIDERS, AIProvider, getFallbackProvider } from "./aiProviders";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallAIParams {
  provider: AIProvider;
  messages: ChatMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}

export interface CallAIResult {
  content: string;
  usedProvider: AIProvider;
  didFallback: boolean;
}

export class AIDisabledError extends Error {
  constructor() {
    super("AI_DISABLED");
    this.name = "AIDisabledError";
  }
}

// Groq: gioi han TPM cua free tier
// Gemini: 4096 du cho moi JSON output, tranh sinh qua nhieu token
const PROVIDER_MAX_TOKENS: Record<AIProvider, number> = {
  groq: 3000,
  gemini: 4096,
};

// --- Groq: dung OpenAI-compatible API ---
async function callGroq(params: Omit<CallAIParams, "provider">): Promise<string> {
  const config = AI_PROVIDERS["groq"];
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Thieu GROQ_API_KEY");

  const body: Record<string, unknown> = {
    model: config.model,
    messages: params.messages,
    temperature: params.temperature ?? 0.3,
    max_tokens: Math.min(params.max_tokens ?? PROVIDER_MAX_TOKENS.groq, PROVIDER_MAX_TOKENS.groq),
  };
  if (params.response_format) body.response_format = params.response_format;

  const t0 = Date.now();
  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const httpMs = Date.now() - t0;

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text();
    console.error(`[AI:groq] HTTP ${status} after ${httpMs}ms`);
    if (status === 429 || status >= 500) {
      throw Object.assign(new Error(`Provider groq loi: ${errText}`), { status, eligible: true });
    }
    throw new Error(`Provider groq loi (${status}): ${errText}`);
  }

  const data = await response.json();
  const finishReason = data.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    throw Object.assign(
      new Error("Provider groq bi cat ngang (finish_reason=length)"),
      { status: 500, eligible: true }
    );
  }
  return data.choices?.[0]?.message?.content ?? "{}";
}

// --- Gemini: dung native generateContent API voi thinkingBudget=0 (nhanh hon ~40%) ---
async function callGemini(params: Omit<CallAIParams, "provider">): Promise<string> {
  const config = AI_PROVIDERS["gemini"];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Thieu GEMINI_API_KEY");

  // Chuyen tu OpenAI message format sang Gemini format
  // System message -> tach rieng, User/Assistant -> contents array
  const systemMsg = params.messages.find(m => m.role === "system");
  const chatMessages = params.messages.filter(m => m.role !== "system");

  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Neu system message ton tai, them vao dau user message dau tien
  if (systemMsg && contents.length > 0 && contents[0].role === "user") {
    contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
  }

  const generationConfig: Record<string, unknown> = {
    temperature: params.temperature ?? 0.3,
    maxOutputTokens: Math.min(params.max_tokens ?? PROVIDER_MAX_TOKENS.gemini, PROVIDER_MAX_TOKENS.gemini),
    // Tat thinking mode: giam latency tu ~16s xuong ~10s
    thinkingConfig: { thinkingBudget: 0 },
  };
  // JSON mode
  if (params.response_format?.type === "json_object") {
    generationConfig.responseMimeType = "application/json";
  }

  const t0 = Date.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig }),
    }
  );

  const httpMs = Date.now() - t0;

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text();
    console.error(`[AI:gemini] HTTP ${status} after ${httpMs}ms`);
    if (status === 429 || status >= 500) {
      throw Object.assign(new Error(`Provider gemini loi: ${errText}`), { status, eligible: true });
    }
    throw new Error(`Provider gemini loi (${status}): ${errText}`);
  }

  const data = await response.json();

  // Kiem tra loi tu phia Gemini (co the tra 200 nhung van co error ben trong)
  if (data.error) {
    const status = data.error.code ?? 500;
    console.error(`[AI:gemini] Inner error ${status} after ${httpMs}ms:`, data.error.message);
    if (status === 429 || status >= 500) {
      throw Object.assign(new Error(`Provider gemini loi: ${JSON.stringify(data)}`), { status, eligible: true });
    }
    throw new Error(`Provider gemini loi: ${data.error.message}`);
  }
  // Gemini tra ve mang, moi phan tu co the la error
  if (Array.isArray(data) && data[0]?.error) {
    const status = data[0].error.code ?? 500;
    console.error(`[AI:gemini] Array error ${status} after ${httpMs}ms`);
    if (status === 429 || status >= 500) {
      throw Object.assign(new Error(`Provider gemini loi: ${JSON.stringify(data)}`), { status, eligible: true });
    }
    throw new Error(`Provider gemini loi: ${data[0].error.message}`);
  }

  const candidate = data.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (finishReason === "MAX_TOKENS") {
    throw Object.assign(
      new Error("Provider gemini bi cat ngang (MAX_TOKENS)"),
      { status: 500, eligible: true }
    );
  }

  return candidate?.content?.parts?.[0]?.text ?? "{}";
}

async function callProvider(
  provider: AIProvider,
  params: Omit<CallAIParams, "provider">
): Promise<string> {
  if (provider === "groq") return callGroq(params);
  if (provider === "gemini") return callGemini(params);
  throw new Error(`Unknown provider: ${provider}`);
}

export async function callAI(params: CallAIParams): Promise<CallAIResult> {
  const { provider, ...rest } = params;

  try {
    const content = await callProvider(provider, rest);
    return { content, usedProvider: provider, didFallback: false };
  } catch (err: unknown) {
    console.error(`[AI Provider: ${provider}] Failed:`, err);
    const isEligible =
      err instanceof Error && (err as { eligible?: boolean }).eligible === true;

    if (!isEligible) throw err;

    // Thu fallback provider
    const fallback = getFallbackProvider(provider);
    try {
      console.warn(`[AI Fallback] Attempting ${fallback}...`);
      const content = await callProvider(fallback, rest);
      return { content, usedProvider: fallback, didFallback: true };
    } catch (fallbackErr) {
      console.error(`[AI Provider: ${fallback}] Failed:`, fallbackErr);
      throw new AIDisabledError();
    }
  }
}

export function extractJson(content: string): string {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || start > end) {
    return content;
  }
  return content.slice(start, end + 1);
}
