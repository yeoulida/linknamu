"use server";

import { Binary, ObjectId } from "mongodb";
import { refresh, updateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { profileTag } from "@/lib/data";
import { collections } from "@/lib/db";
import { charLength, getString, LIMITS, normalizeUrl } from "@/lib/validation";

export type ActionResult = { ok?: boolean; error?: string } | undefined;

/** 모든 관리 액션의 공통 인증 검사 */
async function requireOwner() {
  const session = await getSession();
  if (!session || !ObjectId.isValid(session.userId)) {
    throw new Error("로그인이 필요합니다.");
  }
  return { userId: new ObjectId(session.userId), username: session.username };
}

function done(username: string): ActionResult {
  updateTag(profileTag(username)); // 공개 페이지 캐시 갱신
  refresh(); // 관리 페이지 새로고침
  return { ok: true };
}

function parseId(raw: unknown): ObjectId | null {
  return typeof raw === "string" && ObjectId.isValid(raw) ? new ObjectId(raw) : null;
}

/* ---------- 프로필 ---------- */

export async function updateProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const name = getString(formData, "name");
  const bio = getString(formData, "bio");

  if (charLength(name) < 1 || charLength(name) > LIMITS.nameMax) {
    return { error: `이름은 1~${LIMITS.nameMax}자여야 합니다.` };
  }
  if (charLength(bio) > LIMITS.bioMax) {
    return { error: `한 줄 소개는 ${LIMITS.bioMax}자 이하여야 합니다.` };
  }

  const { users } = await collections();
  await users.updateOne({ _id: userId }, { $set: { name, bio } });
  return done(username);
}

const STORED_AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "사진 파일을 선택하세요." };
  }
  if (!STORED_AVATAR_TYPES.includes(file.type)) {
    return { error: "JPG, PNG, WebP 이미지만 업로드할 수 있습니다." };
  }
  if (file.size > LIMITS.avatarStoredMaxBytes) {
    return { error: "이미지가 너무 큽니다." };
  }

  const { users, avatars } = await collections();
  const now = new Date();
  await avatars.updateOne(
    { _id: userId },
    {
      $set: {
        data: new Binary(Buffer.from(await file.arrayBuffer())),
        contentType: file.type,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  await users.updateOne(
    { _id: userId },
    { $set: { avatarUrl: `/api/avatar/${userId.toHexString()}?v=${now.getTime()}` } },
  );
  return done(username);
}

export async function removeAvatar(): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const { users, avatars } = await collections();
  await avatars.deleteOne({ _id: userId });
  await users.updateOne({ _id: userId }, { $set: { avatarUrl: null } });
  return done(username);
}

/* ---------- 링크 ---------- */

function readLinkFields(formData: FormData): { title: string; url: string } | { error: string } {
  const title = getString(formData, "title");
  const url = normalizeUrl(getString(formData, "url"));
  if (charLength(title) < 1 || charLength(title) > LIMITS.linkTitleMax) {
    return { error: `링크 제목은 1~${LIMITS.linkTitleMax}자여야 합니다.` };
  }
  if (!url) {
    return { error: "http:// 또는 https://로 시작하는 올바른 URL을 입력하세요." };
  }
  return { title, url };
}

export async function addLink(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const fields = readLinkFields(formData);
  if ("error" in fields) return fields;

  const { links } = await collections();
  const count = await links.countDocuments({ userId });
  if (count >= LIMITS.linksPerUser) {
    return { error: `링크는 최대 ${LIMITS.linksPerUser}개까지 등록할 수 있습니다.` };
  }
  const last = await links.find({ userId }).sort({ order: -1 }).limit(1).next();

  await links.insertOne({
    _id: new ObjectId(),
    userId,
    title: fields.title,
    url: fields.url,
    order: last ? last.order + 1 : 0,
    clickCount: 0,
    createdAt: new Date(),
  });
  return done(username);
}

export async function updateLink(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const id = parseId(formData.get("id"));
  if (!id) return { error: "잘못된 요청입니다." };
  const fields = readLinkFields(formData);
  if ("error" in fields) return fields;

  const { links } = await collections();
  const res = await links.updateOne({ _id: id, userId }, { $set: fields });
  if (res.matchedCount === 0) return { error: "링크를 찾을 수 없습니다." };
  return done(username);
}

export async function deleteLink(linkId: string): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const id = parseId(linkId);
  if (!id) return { error: "잘못된 요청입니다." };

  const { links } = await collections();
  await links.deleteOne({ _id: id, userId });
  return done(username);
}

export async function moveLink(linkId: string, direction: "up" | "down"): Promise<ActionResult> {
  const { userId, username } = await requireOwner();
  const id = parseId(linkId);
  if (!id) return { error: "잘못된 요청입니다." };

  const { links } = await collections();
  const list = await links
    .find({ userId }, { projection: { _id: 1 } })
    .sort({ order: 1 })
    .toArray();
  const index = list.findIndex((l) => l._id.equals(id));
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) return { ok: true };

  [list[index], list[target]] = [list[target], list[index]];
  // 순서를 0..n-1로 다시 매겨 저장
  await links.bulkWrite(
    list.map((l, order) => ({
      updateOne: { filter: { _id: l._id, userId }, update: { $set: { order } } },
    })),
  );
  return done(username);
}
