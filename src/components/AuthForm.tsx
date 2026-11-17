"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/lib/actions/auth";
import { inspect } from "@/lib/inspect";
import { LIMITS } from "@/lib/validation";

const inputClass =
  "mt-1 block min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isSignup ? signup : login,
    undefined,
  );

  return (
    <form
      {...inspect("AuthForm", "src/components/AuthForm.tsx")}
      action={formAction}
      className="flex flex-col gap-4"
    >
      <label className="block text-sm font-medium">
        이메일
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>

      <label className="block text-sm font-medium">
        비밀번호
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? LIMITS.passwordMin : undefined}
          maxLength={72}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={inputClass}
        />
        {isSignup && (
          <span className="mt-1 block text-xs text-muted">{LIMITS.passwordMin}자 이상</span>
        )}
      </label>

      {isSignup && (
        <label className="block text-sm font-medium">
          username (공유 주소)
          <div className="mt-1 flex items-center rounded-xl border border-border bg-surface transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
            <span className="pl-4 text-muted">/</span>
            <input
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]{3,20}"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="min-h-12 w-full rounded-xl bg-transparent pl-1 pr-4 text-base outline-none"
            />
          </div>
          <span className="mt-1 block text-xs text-muted">영문 소문자·숫자·_ 3~20자</span>
        </label>
      )}

      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 min-h-12 rounded-full bg-brand font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
      >
        {pending ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "이미 계정이 있나요? " : "처음이신가요? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-brand underline">
          {isSignup ? "로그인" : "회원가입"}
        </Link>
      </p>
    </form>
  );
}
