"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "⚡" },
  { label: "Phỏng vấn", href: "/interview", icon: "🎯" },
  { label: "Phân tích JD", href: "/jd-analyzer", icon: "📋" },
  { label: "Code Review", href: "/code-review", icon: "🔍" },
  { label: "Bài tập", href: "/exercises", icon: "💻" },
  { label: "Lịch sử", href: "/history", icon: "📊" },
  { label: "Thành tựu", href: "/achievements", icon: "🏆" },
];

const HIDDEN_ROUTES = ["/login", "/auth"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isHidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isHidden) return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowDropdown(false);
    router.push("/login");
  };

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
      <div className="max-w-full mx-auto px-6 flex items-center h-16 gap-1">
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

        {/* User avatar + dropdown */}
        {user && (
          <div className="relative shrink-0 ml-2">
            <button
              id="user-avatar-btn"
              onClick={() => setShowDropdown((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
            >
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ outline: "2px solid rgba(139,92,246,0.4)", outlineOffset: "1px" }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium hidden md:block max-w-[100px] truncate" style={{ color: "var(--foreground)" }}>
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl py-1 z-50 shadow-2xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
                >
                  {/* Thông tin user */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                      {user.user_metadata?.full_name || "Người dùng"}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                      {user.email}
                    </p>
                  </div>

                  {/* 👤 Hồ Sơ - thêm mới */}
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "var(--foreground)" }}
                  >
                    👤 Hồ Sơ
                  </Link>

                  {/* 🚪 Đăng xuất */}
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "#ef4444" }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}