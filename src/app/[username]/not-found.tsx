import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl" aria-hidden="true">
        🍂
      </p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">주소가 올바른지 확인해 주세요.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-medium text-white transition hover:bg-brand-strong"
      >
        링크 나무 홈으로
      </Link>
    </main>
  );
}
