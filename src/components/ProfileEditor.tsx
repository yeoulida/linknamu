"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Avatar from "@/components/Avatar";
import {
  removeAvatar,
  updateProfile,
  uploadAvatar,
  type ActionResult,
} from "@/lib/actions/admin";
import { AVATAR_SOURCE_TYPES, LIMITS } from "@/lib/validation";

type Props = { name: string; bio: string; avatarUrl: string | null };

const inputClass =
  "mt-1 block min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

/** 원본 이미지를 400×400 정사각형으로 잘라 줄인다 (업로드 용량 최소화) */
async function resizeImage(file: File, size = 400): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  // WebP 인코딩을 지원하지 않는 브라우저는 JPEG로 대체
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("encode failed");
  return jpeg;
}

export default function ProfileEditor({ name, bio, avatarUrl }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateProfile,
    undefined,
  );
  // 제어 컴포넌트로 두어 저장 실패 시에도 입력값이 유지되도록 한다
  const [nameValue, setNameValue] = useState(name);
  const [bioValue, setBioValue] = useState(bio);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError(null);

    if (!AVATAR_SOURCE_TYPES.includes(file.type)) {
      setAvatarError("JPG, PNG, WebP 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > LIMITS.avatarSourceMaxBytes) {
      setAvatarError("사진은 최대 5MB까지 업로드할 수 있습니다.");
      return;
    }

    startUpload(async () => {
      try {
        const blob = await resizeImage(file);
        const ext = blob.type === "image/webp" ? "webp" : "jpg";
        const fd = new FormData();
        fd.append("avatar", new File([blob], `avatar.${ext}`, { type: blob.type }));
        const res = await uploadAvatar(fd);
        if (res?.error) setAvatarError(res.error);
      } catch {
        setAvatarError("사진을 처리하지 못했습니다. 다른 사진으로 시도해 주세요.");
      }
    });
  }

  function onRemove() {
    setAvatarError(null);
    startUpload(async () => {
      const res = await removeAvatar();
      if (res?.error) setAvatarError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={name} size={80} />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={AVATAR_SOURCE_TYPES.join(",")}
            onChange={onFileChange}
            className="sr-only"
            id="avatar-input"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="min-h-11 rounded-full border border-border px-4 text-sm font-medium transition hover:border-brand disabled:opacity-60"
          >
            {uploading ? "처리 중…" : "사진 변경"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={onRemove}
              className="min-h-11 rounded-full px-4 text-sm font-medium text-muted transition hover:text-danger disabled:opacity-60"
            >
              삭제
            </button>
          )}
          <p className="w-full text-xs text-muted">JPG·PNG·WebP, 최대 5MB</p>
        </div>
      </div>
      {avatarError && (
        <p role="alert" className="-mt-3 text-sm text-danger">
          {avatarError}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <label className="block text-sm font-medium">
          이름
          <input
            name="name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            required
            maxLength={LIMITS.nameMax}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          <span className="flex justify-between">
            한 줄 소개
            <span className="font-normal text-muted">
              {[...bioValue].length}/{LIMITS.bioMax}
            </span>
          </span>
          <input
            name="bio"
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            maxLength={LIMITS.bioMax}
            placeholder="예) 프론트엔드 개발자입니다"
            className={inputClass}
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
          >
            {pending ? "저장 중…" : "프로필 저장"}
          </button>
          <span aria-live="polite" className="text-sm">
            {state?.error && <span className="text-danger">{state.error}</span>}
            {state?.ok && !pending && <span className="text-brand">저장했어요</span>}
          </span>
        </div>
      </form>
    </div>
  );
}
