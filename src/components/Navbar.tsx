"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "⚡" },
  { label: "Thành tựu", href: "/achievements", icon: "🏆" },
  { label: "Phỏng vấn", href: "/interview", icon: "🎯" },
  { label: "Phân tích JD", href: "/jd-analyzer", icon: "📋" },
  { label: "Code Review", href: "/code-review", icon: "🔍" },
  { label: "Bài tập", href: "/exercises", icon: "💻" },
  { label: "Lịch sử", href: "/history", icon: "📊" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      style={{
        background: "rgba(8, 8, 16, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center h-16 gap-1">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6 group shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            🚀
          </div>
          <span
            className="font-extrabold text-lg gradient-text hidden sm:block"
            style={{ letterSpacing: "-0.02em" }}
          >
            Interview Prep
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 relative group"
                style={{
                  color: active ? "var(--primary-light)" : "var(--muted)",
                  background: active ? "rgba(139, 92, 246, 0.12)" : "transparent",
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                )}
                {!active && (
                  <span
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(139, 92, 246, 0.06)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}