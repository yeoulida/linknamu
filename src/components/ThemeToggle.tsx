"use client";

import { inspect } from "@/lib/inspect";
import { THEME_STORAGE_KEY } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

/** 화면 오른쪽 위의 밝은/어두운 화면 전환 버튼 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 저장이 막힌 브라우저(일부 인앱 브라우저 등)에서는 이번 방문에만 적용
    }
  }

  return (
    <button
      {...inspect("ThemeToggle", "src/components/ThemeToggle.tsx")}
      type="button"
      onClick={toggle}
      aria-label="밝은 화면과 어두운 화면 전환"
      title="밝은/어두운 화면 전환"
      className="fixed right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {/* 어두운 화면에서는 해(밝게), 밝은 화면에서는 달(어둡게)을 보여 준다 */}
      <span className="hidden dark:block">
        <SunIcon />
      </span>
      <span className="block dark:hidden">
        <MoonIcon />
      </span>
    </button>
  );
}
