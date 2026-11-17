import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import CopyUrlButton from "@/components/CopyUrlButton";
import LinkManager from "@/components/LinkManager";
import ProfileEditor from "@/components/ProfileEditor";
import { logout } from "@/lib/actions/auth";
import { getSession } from "@/lib/auth";
import { getAdminData } from "@/lib/data";
import { inspect } from "@/lib/inspect";
import { LIMITS } from "@/lib/validation";

export const metadata: Metadata = { title: "관리", robots: { index: false } };

const FILE = "src/app/admin/page.tsx";

export default function AdminPage() {
  return (
    <main
      {...inspect("AdminPage", FILE)}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:py-10"
    >
      {/* 오른쪽 위 화면 전환 버튼과 겹치지 않도록 오른쪽 여백(pr-12) */}
      <header
        {...inspect("AdminHeader", FILE)}
        className="mb-6 flex items-center justify-between pr-12"
      >
        <Link href="/" className="inline-flex items-center gap-2 font-bold">
          <span aria-hidden="true">🌳</span> 링크 나무
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="min-h-11 rounded-full px-4 text-sm font-medium text-muted transition hover:text-foreground"
          >
            로그아웃
          </button>
        </form>
      </header>
      <Suspense fallback={<p className="py-12 text-center text-muted">불러오는 중…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getAdminData(session.userId);
  if (!data) {
    return (
      <p className="rounded-2xl bg-danger/10 p-4 text-danger">
        계정 정보를 찾을 수 없습니다. 로그아웃 후 다시 로그인해 주세요.
      </p>
    );
  }

  const shareUrl = `${await getOrigin()}/${data.username}`;
  const totalClicks = data.links.reduce((sum, l) => sum + l.clickCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <Section title="내 공유 URL">
        <div className="flex items-center gap-2">
          <a
            href={`/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate rounded-xl bg-background px-4 py-3 font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            {shareUrl.replace(/^https?:\/\//, "")}
          </a>
          <CopyUrlButton url={shareUrl} />
        </div>
      </Section>

      <Section title="프로필">
        <ProfileEditor name={data.name} bio={data.bio} avatarUrl={data.avatarUrl} />
      </Section>

      <Section
        title="링크"
        aside={
          <span className="text-sm text-muted">
            {data.links.length}/{LIMITS.linksPerUser}개 · 총 클릭 {totalClicks.toLocaleString("ko-KR")}회
          </span>
        }
      >
        <LinkManager links={data.links} />
      </Section>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section
      {...inspect(`Section(${title})`, FILE)}
      className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
