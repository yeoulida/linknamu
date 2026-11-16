"use client";

import { getLinkIcon } from "@/lib/link-icon";

type Props = { id: string; title: string; url: string };

function trackClick(id: string) {
  const endpoint = `/api/click/${id}`;
  try {
    // sendBeacon은 페이지 이동/탭 전환 중에도 전송되며 이동을 막지 않는다
    if (navigator.sendBeacon?.(endpoint)) return;
    void fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
  } catch {
    // 집계 실패는 무시 (F3-4)
  }
}

/** 카드 전체가 클릭 영역, 새 탭으로 이동 (F2-3) */
export default function LinkCard({ id, title, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick(id)}
      onAuxClick={(e) => {
        if (e.button === 1) trackClick(id); // 마우스 휠 클릭
      }}
      className="group relative flex min-h-14 w-full items-center rounded-2xl border border-border bg-surface px-14 py-4 text-center font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:translate-y-0"
    >
      <span aria-hidden="true" className="absolute left-4 text-xl leading-none">
        {getLinkIcon(url)}
      </span>
      <span className="w-full">{title}</span>
    </a>
  );
}
