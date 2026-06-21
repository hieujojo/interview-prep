export const QUESTION_POOL: Record<string, string[]> = {
  React: [
    "useEffect và useLayoutEffect khác nhau như thế nào, khi nào dùng cái nào?",
    "Giải thích cơ chế reconciliation và Virtual DOM trong React.",
    "Khi nào nên dùng useMemo/useCallback, và khi nào nó phản tác dụng?",
    "Controlled vs Uncontrolled component khác nhau ra sao?",
    "Giải thích key trong list render, tại sao không nên dùng index làm key.",
  ],
  "Next.js": [
    "Server Component và Client Component khác nhau ra sao, khi nào dùng cái nào?",
    "Giải thích các chiến lược render: SSR, SSG, ISR khác nhau thế nào?",
    "Route Handler trong App Router hoạt động ra sao?",
  ],
  "Node.js": [
    "Event loop trong Node.js hoạt động như thế nào?",
    "Giải thích sự khác nhau giữa process.nextTick và setImmediate.",
    "Làm sao để xử lý lỗi trong async/await đúng cách?",
  ],
  "REST API": [
    "Sự khác nhau giữa PUT và PATCH là gì?",
    "Idempotency trong API nghĩa là gì, vì sao quan trọng?",
  ],
  PostgreSQL: [
    "Index hoạt động như thế nào, khi nào index làm chậm query?",
    "Giải thích sự khác nhau giữa INNER JOIN và LEFT JOIN.",
  ],
  // TODO: bổ sung thêm câu hỏi cho các topic còn lại
};

export function getRandomQuestions(topic: string, count: number): string[] {
  const pool = QUESTION_POOL[topic] ?? [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}