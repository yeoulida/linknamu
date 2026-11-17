import Link from "next/link";
import { inspect } from "@/lib/inspect";

const FILE = "src/app/page.tsx";

export default function Home() {
  return (
    <main
      {...inspect("HomePage", FILE)}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16"
    >
      <p className="text-5xl" aria-hidden="true">
        🌳
      </p>
      <h1 {...inspect("HomeTitle", FILE)} className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
        내 모든 링크를
        <br />
        하나의 URL로.
      </h1>
      <p {...inspect("HomeIntro", FILE)} className="mt-4 text-lg text-muted">
        인스타그램, 유튜브, 블로그, 포트폴리오… 흩어진 링크를 링크 나무 한 페이지에 모으고 SNS
        프로필에 걸어 두세요. 어떤 링크가 많이 클릭되는지도 확인할 수 있어요.
      </p>

      <div {...inspect("HomeButtons", FILE)} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong"
        >
          무료로 시작하기
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-surface px-6 font-semibold transition hover:border-brand"
        >
          로그인
        </Link>
      </div>

      <ul {...inspect("HomeFeatures", FILE)} className="mt-12 grid gap-3 text-sm text-muted sm:grid-cols-3">
        <li className="rounded-2xl border border-border bg-surface p-4">
          <span className="block text-xl">🔗</span>
          링크 최대 30개를 카드로 정리
        </li>
        <li className="rounded-2xl border border-border bg-surface p-4">
          <span className="block text-xl">📱</span>
          모바일·인앱 브라우저에 최적화
        </li>
        <li className="rounded-2xl border border-border bg-surface p-4">
          <span className="block text-xl">📊</span>
          링크별 클릭 수 집계
        </li>
      </ul>
    </main>
  );
}
