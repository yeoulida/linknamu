import Link from "next/link";
import type { ReactNode } from "react";
import { inspect } from "@/lib/inspect";

export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main
      {...inspect("AuthCard", "src/components/AuthCard.tsx")}
      className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12"
    >
      <Link href="/" className="mb-6 inline-flex items-center gap-2 self-start font-bold">
        <span aria-hidden="true">🌳</span> 링크 나무
      </Link>
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </main>
  );
}
