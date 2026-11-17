"use client"; // 오류 화면(Error Boundary)은 클라이언트 컴포넌트여야 한다

import Link from "next/link";
import { useEffect } from "react";
import { inspect } from "@/lib/inspect";

/**
 * 서버 오류(예: 데이터베이스 연결 실패)가 나면 빈 오류 화면 대신 보여 줄 안내 화면.
 * 세부 오류 내용은 방문자에게 보여 주지 않고 콘솔에만 남긴다.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      {...inspect("ErrorPage", "src/app/error.tsx")}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center"
    >
      <p className="text-5xl" aria-hidden="true">
        🌧️
      </p>
      <h1 className="mt-4 text-xl font-bold">잠시 페이지를 불러오지 못했어요</h1>
      <p className="mt-2 text-muted">일시적인 문제일 수 있어요. 잠시 후 다시 시도해 주세요.</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-medium text-white transition hover:bg-brand-strong"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-5 font-medium transition hover:border-brand"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
