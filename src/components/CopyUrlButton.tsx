"use client";

import { useState } from "react";

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 일부 인앱 브라우저는 Clipboard API를 막는다 → 구형 방식으로 대체
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-11 shrink-0 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
    >
      <span aria-live="polite">{copied ? "복사됨 ✓" : "복사"}</span>
    </button>
  );
}
