import "server-only";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { collections } from "./db";

export type PublicLink = { id: string; title: string; url: string };

export type PublicProfile = {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  links: PublicLink[];
};

export type AdminLink = PublicLink & { clickCount: number };

export type AdminData = {
  username: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  links: AdminLink[];
};

export const profileTag = (username: string) => `profile:${username}`;

/**
 * 공개 페이지용 데이터. 클릭 수는 포함하지 않는다(F3-3).
 * 프로필/링크가 바뀌면 profileTag(username)으로 무효화한다.
 */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(profileTag(username));

  const { users, links } = await collections();
  const user = await users.findOne(
    { username },
    { projection: { username: 1, name: 1, bio: 1, avatarUrl: 1 } },
  );
  if (!user) return null;

  const docs = await links
    .find({ userId: user._id }, { projection: { title: 1, url: 1 } })
    .sort({ order: 1 })
    .toArray();

  return {
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    links: docs.map((l) => ({ id: l._id.toHexString(), title: l.title, url: l.url })),
  };
}

/** 관리 페이지용 데이터 (캐시하지 않음 — 항상 최신 클릭 수) */
export async function getAdminData(userId: string): Promise<AdminData | null> {
  if (!ObjectId.isValid(userId)) return null;
  const { users, links } = await collections();
  const _id = new ObjectId(userId);
  const user = await users.findOne({ _id });
  if (!user) return null;

  const docs = await links.find({ userId: _id }).sort({ order: 1 }).toArray();
  return {
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    links: docs.map((l) => ({
      id: l._id.toHexString(),
      title: l.title,
      url: l.url,
      clickCount: l.clickCount,
    })),
  };
}
