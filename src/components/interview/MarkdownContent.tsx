"use client";

import { useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsxLang from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsxLang from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescriptLang from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascriptLang from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import csharpLang from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import pythonLang from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sqlLang from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import bashLang from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/prism/json";
import cssLang from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markupLang from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Only register the languages this app actually produces, so the bundle
// doesn't pull in Prism's full language set.
SyntaxHighlighter.registerLanguage("jsx", jsxLang);
SyntaxHighlighter.registerLanguage("tsx", tsxLang);
SyntaxHighlighter.registerLanguage("typescript", typescriptLang);
SyntaxHighlighter.registerLanguage("ts", typescriptLang);
SyntaxHighlighter.registerLanguage("javascript", javascriptLang);
SyntaxHighlighter.registerLanguage("js", javascriptLang);
SyntaxHighlighter.registerLanguage("csharp", csharpLang);
SyntaxHighlighter.registerLanguage("cs", csharpLang);
SyntaxHighlighter.registerLanguage("c#", csharpLang);
SyntaxHighlighter.registerLanguage("python", pythonLang);
SyntaxHighlighter.registerLanguage("py", pythonLang);
SyntaxHighlighter.registerLanguage("sql", sqlLang);
SyntaxHighlighter.registerLanguage("bash", bashLang);
SyntaxHighlighter.registerLanguage("sh", bashLang);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("css", cssLang);
SyntaxHighlighter.registerLanguage("html", markupLang);
SyntaxHighlighter.registerLanguage("markup", markupLang);

const SUPPORTED_LANGS = new Set([
  "jsx", "tsx", "typescript", "ts", "javascript", "js", "csharp", "cs", "c#",
  "python", "py", "sql", "bash", "sh", "json", "css", "html", "markup",
]);

/**
 * Lightweight markdown-lite renderer tuned for the AI review content coming
 * back from /api/hint and /api/review (Vietnamese text with **bold**,
 * `inline code`, ordered/bullet lists, ``` code fences and | table | rows |).
 *
 * This version adds two safety nets on top of the "please format nicely"
 * system prompt, because LLM output is never 100% guaranteed to follow
 * formatting instructions:
 *   1. Numbered lists the model ran together on a single line
 *      ("1. A 2. B 3. C") get split back into real list items.
 *   2. Code the model forgot to wrap in ``` fences (e.g. "jsx import
 *      React, { useState } from 'react'; function ...") gets detected
 *      and rendered as a code block anyway. If the model's code already
 *      had real line breaks, those are preserved as-is; a best-effort
 *      reflow is only attempted when the code truly arrived as one
 *      smashed line.
 *
 * Drop this file in e.g. src/components/interview/MarkdownContent.tsx.
 */

type MDListItem = { num?: number; text: string };

type MDBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: MDListItem[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; lang: string; code: string };

function isSeparatorRow(line: string) {
  return /^\|[\s\-:|]+\|$/.test(line);
}

// ── Safety net 1: split "1. A 2. B 3. C" (all on one line) into real list lines ──
function splitInlineOrderedList(text: string): string {
  const marker = /(\d{1,2})\.\s+/g;
  const positions: { index: number; num: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = marker.exec(text)) !== null) {
    positions.push({ index: match.index, num: parseInt(match[1], 10) });
  }
  // Only treat as a run-together list if we see a genuine 1,2,3... sequence
  if (positions.length < 2 || positions[0].num !== 1) return text;
  for (let i = 1; i < positions.length; i++) {
    if (positions[i].num !== positions[i - 1].num + 1) return text;
  }

  const intro = text.slice(0, positions[0].index).trimEnd();
  let result = intro;
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    const segment = text.slice(start, end).trimEnd();
    result += (result ? "\n" : "") + segment;
  }
  return result;
}

// ── Safety net 2: detect code the model forgot to fence, and reflow it ──
// Generic, language-agnostic detector: looks for common code keywords AND
// a high density of structural characters ({ } ;). Prose almost never has
// 2+ of these characters, so this rarely false-positives on normal text.
const CODE_KEYWORDS_BY_LANG: Record<string, string[]> = {
  common: ["return", "const", "let", "var", "new\\s+\\w+\\("],
  csharp: [
    "public", "private", "protected", "static", "void", "class",
    "struct", "namespace", "using", "int", "string", "bool", "decimal",
  ],
  js: ["function", "import", "console\\.", "=>"],
  python: ["def", "print"],
};

function buildKeywordRegex(byLang: Record<string, string[]>) {
  const allKeywords = Object.values(byLang).flat();
  return new RegExp(`\\b(${allKeywords.join("|")})\\b|=>`);
}

const CODE_KEYWORD_RE = buildKeywordRegex(CODE_KEYWORDS_BY_LANG);

function codeDensity(s: string) {
  const structural = (s.match(/[{}();<>]/g) || []).length;
  const words = s.split(/\s+/).filter(Boolean).length;
  return words === 0 ? 0 : structural / words;
}

function looksLikeCode(s: string, opts: { requireKeyword?: boolean; minDensity?: number } = {}) {
  const { requireKeyword = true, minDensity = 0.15 } = opts;
  if (requireKeyword && !CODE_KEYWORD_RE.test(s)) return false;
  const structuralCount = (s.match(/[{}();<>]/g) || []).length;
  return structuralCount >= 2 && codeDensity(s) >= minDensity;
}

function guessLang(s: string) {
  if (/\bdef\s|print\(/.test(s)) return "python";
  if (
    /\b(public|private|protected)\s+(class|void|static|decimal|int|string|bool)\b/.test(s) ||
    /Console\.Write|ToListAsync|IQueryable|IEnumerable|\.HasValue\b|Response\.Headers/.test(s)
  ) {
    return "csharp";
  }
  if (/useState|useEffect|<\/?[A-Z]/.test(s)) return "jsx";
  if (/\bSELECT\b|\bFROM\b/i.test(s)) return "sql";
  return "js";
}

// Best-effort pretty-print for code that arrived as one long smashed line.
//
// IMPORTANT: the naive `{`/`}` splitting below can't distinguish a real
// code-block brace (`if (x) {`) from a short "{...}" span that's just part
// of the code's own syntax or literal content — a route template like
// `"{id}"`, a string-interpolation placeholder `"{name}"`, or a small
// object/anonymous-type literal `{ id, name }`. Blindly splitting on every
// brace shreds `[HttpGet("{id}")]` into three separate lines. To avoid
// that, short "{...}" spans are protected with a placeholder before the
// split and restored afterwards.
function reflowInlineCode(code: string): string {
  const protectedSpans: string[] = [];
  const withPlaceholders = code.replace(/\{[^{}\n]{1,40}\}/g, (m) => {
    protectedSpans.push(m);
    return `\u0000${protectedSpans.length - 1}\u0000`;
  });

  const spaced = withPlaceholders
    .replace(/;\s*/g, ";\n")
    .replace(/\{\s*/g, " {\n")
    .replace(/\}\s*/g, "\n}\n")
    .replace(/\n{2,}/g, "\n");

  const restored = spaced.replace(/\u0000(\d+)\u0000/g, (_, idx) => protectedSpans[Number(idx)]);

  const rawLines = restored.split("\n").map((l) => l.trim()).filter(Boolean);
  let indent = 0;
  const indented = rawLines.map((line) => {
    if (line.startsWith("}")) indent = Math.max(0, indent - 1);
    const withIndent = "  ".repeat(indent) + line;
    if (line.endsWith("{")) indent++;
    return withIndent;
  });
  return indented.join("\n");
}

function parseMarkdownLite(rawInput: string): MDBlock[] {
  const blocks: MDBlock[] = [];
  const safeInput =
    typeof rawInput === "string"
      ? rawInput
      : rawInput == null
      ? ""
      : JSON.stringify(rawInput, null, 2);
  const preprocessed = splitInlineOrderedList(safeInput.replace(/\r\n/g, "\n"));
  const lines = preprocessed.split("\n");
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === "") {
      i++;
      continue;
    }

    // fenced code block ```lang ... ```
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      if (
        codeLines.length > 0 &&
        lang &&
        codeLines[0].trim().toLowerCase() === lang.toLowerCase()
      ) {
        codeLines.shift();
      }

      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // table block
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const dataLines = tableLines.filter((l) => !isSeparatorRow(l));
      const rows = dataLines.map((l) =>
        l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
      );
      const [headers, ...body] = rows;
      if (headers && headers.length > 0) {
        blocks.push({ type: "table", headers, rows: body });
      }
      continue;
    }

    // standalone bold line -> section heading, e.g. **Props:**
    const headingMatch = line.match(/^\*\*(.+?):?\*\*:?$/);
    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[1] });
      i++;
      continue;
    }

    // ordered list ("1. ", "2. "...) — keep the real source number so
    // numbering stays correct even if the list gets split into several
    // blocks (e.g. a numbered heading followed by its own sub-bullets,
    // then the next numbered heading starts a new block).
    if (/^\d{1,2}\.\s+/.test(line)) {
      const items: MDListItem[] = [];
      while (i < lines.length && /^\d{1,2}\.\s+/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^(\d{1,2})\.\s+(.*)$/);
        if (m) items.push({ num: parseInt(m[1], 10), text: m[2] });
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // bullet list
    if (/^[*-]\s+/.test(line)) {
      const items: MDListItem[] = [];
      while (i < lines.length && /^[*-]\s+/.test(lines[i].trim())) {
        items.push({ text: lines[i].trim().replace(/^[*-]\s+/, "") });
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // paragraph: collect contiguous plain lines
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^\d{1,2}\.\s+/.test(lines[i].trim()) &&
      !/^[*-]\s+/.test(lines[i].trim()) &&
      !/^\*\*(.+?):?\*\*:?$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    // Flattened form is only used to *detect* whether this looks like code
    // (language tag, keyword/brace density). It must never be used as the
    // code itself: joining real source lines with spaces destroys the
    // model's original line breaks/indentation, which used to force even
    // properly multi-line (but unfenced) code down the "guess how to
    // reflow a smashed one-liner" path, mangling things like route
    // templates (`{id}`) in the process.
    const flatText = paraLines.join(" ");

    // safety net: paragraph starts with a language tag followed by code
    const langTagMatch = flatText.match(
      /^(jsx|tsx|js|javascript|ts|typescript|python|css|html|json|bash|sql|csharp|cs|c#)\b[:.]?\s+(.+)$/i
    );
    if (langTagMatch && looksLikeCode(langTagMatch[2], { requireKeyword: false, minDensity: 0.08 })) {
  const lang = langTagMatch[1].toLowerCase();
  if (paraLines.length > 1) {
    const rest = [...paraLines];
    const tagOnlyRe = new RegExp(
      `^(jsx|tsx|js|javascript|ts|typescript|python|css|html|json|bash|sql|csharp|cs|c#)[:.]?$`,
      "i"
    );
    if (tagOnlyRe.test(rest[0].trim())) {
      // Tag đứng riêng 1 dòng, code bắt đầu từ dòng kế tiếp — xóa cả
      // dòng thay vì cố cắt phần đuôi không tồn tại.
      rest.shift();
    } else {
      rest[0] = rest[0].replace(
        /^(jsx|tsx|js|javascript|ts|typescript|python|css|html|json|bash|sql|csharp|cs|c#)\b[:.]?\s+/i,
        ""
      );
    }
    blocks.push({ type: "code", lang, code: rest.join("\n") });
  } else {
    blocks.push({ type: "code", lang, code: reflowInlineCode(langTagMatch[2]) });
  }
  continue;
}

    // safety net: no language tag, but the paragraph is clearly smashed code
    // (this also catches the 2nd, 3rd... chunks of a multi-paragraph snippet
    // where only the very first chunk had a "csharp"/"jsx" language tag)
    if (looksLikeCode(flatText)) {
      const code = paraLines.length > 1 ? paraLines.join("\n") : reflowInlineCode(flatText);
      blocks.push({ type: "code", lang: guessLang(flatText), code });
      continue;
    }

    blocks.push({ type: "paragraph", text: flatText });
  }

  // Merge code blocks that ended up directly adjacent (e.g. a snippet the
  // model split across several blank-line-separated paragraphs) into one
  // continuous code block instead of several disconnected ones.
  const merged: MDBlock[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (block.type === "code" && last && last.type === "code") {
      last.code = `${last.code}\n\n${block.code}`;
      if (!last.lang && block.lang) last.lang = block.lang;
      continue;
    }
    merged.push(block);
  }

  return merged;
}

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong key={`${keyPrefix}-${idx}`} className="font-bold text-foreground">
          {renderInline(inner, `${keyPrefix}-${idx}-b`)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-${idx}`}
          className="px-1.5 py-[1px] rounded-md text-[13px] font-mono"
          style={{ background: "rgba(139,92,246,0.12)", color: "var(--primary)" }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${idx}`}>{part}</span>;
  });
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors (unsupported / permissions)
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden my-3"
      style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 24px -8px rgba(0,0,0,0.4)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#27c93f" }} />
          <span className="ml-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
            {lang || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[11px] font-bold uppercase tracking-wide transition-colors"
          style={{ color: copied ? "var(--success)" : "rgba(255,255,255,0.45)" }}
        >
          {copied ? "✓ Đã copy" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={SUPPORTED_LANGS.has(lang.toLowerCase()) ? lang.toLowerCase() : "javascript"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#12121e",
          fontSize: "13.5px",
          lineHeight: 1.6,
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono, monospace)" } }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MDTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl my-3" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-[13.5px] border-collapse">
        <thead>
          <tr style={{ background: "rgba(139,92,246,0.1)" }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-2.5 font-extrabold whitespace-nowrap"
                style={{ color: "var(--primary)", borderBottom: "1px solid var(--border)" }}
              >
                {renderInline(h, `th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 align-top text-foreground-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  {renderInline(cell, `td-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MDList({ ordered, items }: { ordered: boolean; items: MDListItem[] }) {
  return (
    <ul className="space-y-2.5 my-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-foreground-2">
          {ordered ? (
            <span
              className="mt-[1px] w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
              style={{ background: "rgba(139,92,246,0.15)", color: "var(--primary)" }}
            >
              {item.num ?? i + 1}
            </span>
          ) : (
            <span className="mt-[9px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
          )}
          <span className="pt-[1px]">{renderInline(item.text, `li-${i}`)}</span>
        </li>
      ))}
    </ul>
  );
}

function MDHeading({ text }: { text: string }) {
  return (
    <p className="text-[12.5px] font-extrabold uppercase tracking-widest mt-4 mb-1.5 first:mt-0" style={{ color: "var(--primary)" }}>
      {renderInline(text, "h")}
    </p>
  );
}

export function MarkdownContent({ content }: { content: unknown }) {
  if (content == null || content === "") return null;
  const blocks = parseMarkdownLite(
    typeof content === "string" ? content : JSON.stringify(content)
  );

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "code":
            return <CodeBlock key={i} lang={block.lang} code={block.code} />;
          case "table":
            return <MDTable key={i} headers={block.headers} rows={block.rows} />;
          case "list":
            return <MDList key={i} ordered={block.ordered} items={block.items} />;
          case "heading":
            return <MDHeading key={i} text={block.text} />;
          case "paragraph":
            return (
              <p key={i} className="text-[14.5px] leading-relaxed text-foreground-2 my-1.5">
                {renderInline(block.text, `p-${i}`)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}