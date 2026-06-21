"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Phỏng vấn", href: "/interview" },
  { label: "Phân tích JD", href: "/jd-analyzer" },
  { label: "Code Review", href: "/code-review" },
  { label: "Bài tập", href: "/exercises" },
  { label: "Lịch sử", href: "/history" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-2">
        <span className="font-bold text-lg mr-6 text-primary">Interview Prep</span>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}