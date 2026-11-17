import type { Metadata, Viewport } from "next";
import ComponentInspector from "@/components/ComponentInspector";
import ThemeToggle from "@/components/ThemeToggle";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// OG 이미지 등 메타데이터의 상대 경로를 절대 URL로 만들기 위한 사이트 주소
// 우선순위: NEXT_PUBLIC_SITE_URL → Vercel 운영 도메인 → 로컬 개발 주소
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "링크 나무 — 내 모든 링크를 한 페이지에",
    template: "%s | 링크 나무",
  },
  description: "내 모든 링크를 한 페이지에 모아 두고, 하나의 URL로 공유하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121614" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 아래 스크립트가 브라우저에서 바꾸므로 서버 HTML과 달라도 경고하지 않게 한다
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeToggle />
        {children}
        {/* 개발 모드에서만 표시되는 구성요소 검사 도구 */}
        {process.env.NODE_ENV === "development" && <ComponentInspector />}
      </body>
    </html>
  );
}
