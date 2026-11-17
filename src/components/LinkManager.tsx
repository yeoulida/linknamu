"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addLink,
  deleteLink,
  moveLink,
  updateLink,
  type ActionResult,
} from "@/lib/actions/admin";
import type { AdminLink } from "@/lib/data";
import { inspect } from "@/lib/inspect";
import { getLinkIcon } from "@/lib/link-icon";

const FILE = "src/components/LinkManager.tsx";
import { LIMITS } from "@/lib/validation";

const inputClass =
  "block min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

function LinkFields({
  title,
  url,
  onTitle,
  onUrl,
}: {
  title: string;
  url: string;
  onTitle: (v: string) => void;
  onUrl: (v: string) => void;
}) {
  return (
    <>
      <label className="block text-sm font-medium">
        <span className="sr-only">링크 제목</span>
        <input
          name="title"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          required
          maxLength={LIMITS.linkTitleMax}
          placeholder="링크 제목 (예: 기술 블로그)"
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        <span className="sr-only">URL</span>
        <input
          name="url"
          type="url"
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          required
          pattern="https?://.+"
          placeholder="https://"
          inputMode="url"
          autoCapitalize="none"
          className={inputClass}
        />
      </label>
    </>
  );
}

function AddLinkForm({ disabled }: { disabled: boolean }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const res = await addLink(prev, formData);
      if (res?.ok) {
        setTitle("");
        setUrl("");
      }
      return res;
    },
    undefined,
  );

  if (disabled) {
    return (
      <p className="rounded-2xl bg-brand-soft px-4 py-3 text-sm">
        링크는 최대 {LIMITS.linksPerUser}개까지 등록할 수 있습니다.
      </p>
    );
  }

  return (
    <form
      {...inspect("AddLinkForm", FILE)}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4"
    >
      <LinkFields title={title} url={url} onTitle={setTitle} onUrl={setUrl} />
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
      >
        {pending ? "추가 중…" : "+ 링크 추가"}
      </button>
    </form>
  );
}

function LinkRow({ link, index, total }: { link: AdminLink; index: number; total: number }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const [state, formAction, saving] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const res = await updateLink(prev, formData);
      if (res?.ok) setEditing(false);
      return res;
    },
    undefined,
  );

  function run(fn: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  if (editing) {
    return (
      <li {...inspect("LinkRow(수정 중)", FILE)} className="rounded-2xl border border-brand bg-surface p-4">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={link.id} />
          <LinkFields title={title} url={url} onTitle={setTitle} onUrl={setUrl} />
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 flex-1 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
            >
              {saving ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle(link.title);
                setUrl(link.url);
                setEditing(false);
              }}
              className="min-h-11 flex-1 rounded-full border border-border px-4 text-sm font-medium"
            >
              취소
            </button>
          </div>
        </form>
      </li>
    );
  }

  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-brand-soft hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <li
      {...inspect("LinkRow", FILE)}
      className={`rounded-2xl border border-border bg-surface p-3 transition ${busy ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-2 w-6 shrink-0 text-center text-xl">
          {getLinkIcon(link.url)}
        </span>
        <div className="min-w-0 flex-1 py-1">
          <p className="truncate font-medium">{link.title}</p>
          <p className="truncate text-sm text-muted">{link.url}</p>
        </div>
        <div className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
          <span className="sr-only">클릭 수 </span>
          {link.clickCount.toLocaleString("ko-KR")}
          <span className="ml-0.5 text-xs font-normal">회</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <div className="flex">
          <button
            type="button"
            aria-label={`${link.title} 위로 이동`}
            disabled={busy || index === 0}
            onClick={() => run(() => moveLink(link.id, "up"))}
            className={iconBtn}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`${link.title} 아래로 이동`}
            disabled={busy || index === total - 1}
            onClick={() => run(() => moveLink(link.id, "down"))}
            className={iconBtn}
          >
            ▼
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={busy}
            className="min-h-11 rounded-full px-4 text-sm font-medium transition hover:bg-brand-soft"
          >
            수정
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (confirm(`'${link.title}' 링크를 삭제할까요?`)) {
                run(() => deleteLink(link.id));
              }
            }}
            className="min-h-11 rounded-full px-4 text-sm font-medium text-danger transition hover:bg-danger/10"
          >
            삭제
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </li>
  );
}

export default function LinkManager({ links }: { links: AdminLink[] }) {
  return (
    <div {...inspect("LinkManager", FILE)} className="flex flex-col gap-4">
      {links.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {links.map((link, i) => (
            <LinkRow key={link.id} link={link} index={i} total={links.length} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">아직 링크가 없어요. 첫 링크를 추가해 보세요!</p>
      )}
      <AddLinkForm disabled={links.length >= LIMITS.linksPerUser} />
    </div>
  );
}
