import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/providers/QueryProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Prep",
  description: "Nền tảng luyện phỏng vấn, code review và phân tích JD với AI. Theo dõi tiến độ, luyện tập mỗi ngày.",
   icons: {
    icon: "/InterviewPrep.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
     <body className="min-h-full flex flex-col">
        <QueryProvider>
          <Navbar />
          <main className="flex-1 w-full px-4 py-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}