import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Avatar, { DEFAULT_AVATAR } from "@/components/Avatar";
import LinkCard from "@/components/LinkCard";
import { getPublicProfile } from "@/lib/data";
import { inspect } from "@/lib/inspect";
import { USERNAME_PATTERN } from "@/lib/validation";

const FILE = "src/app/[username]/page.tsx";

async function loadProfile(params: Promise<{ username: string }>) {
  const { username } = await params;
  const normalized = decodeURIComponent(username).toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) return null;
  return getPublicProfile(normalized);
}

// OG 태그: 이름, 소개, 프로필 사진 (비기능 요구사항 SEO/공유)
export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const profile = await loadProfile(params);
  if (!profile) return { title: "페이지를 찾을 수 없습니다" };

  const title = `${profile.name} (@${profile.username})`;
  const description = profile.bio || `${profile.name}님의 링크 모음`;
  // 사진이 없으면 기본 프로필 사진을 미리보기 이미지로 사용 (PRD 8. SEO/공유)
  const images = profile.avatarUrl
    ? [{ url: profile.avatarUrl, width: 400, height: 400, alt: `${profile.name} 프로필 사진` }]
    : [{ url: DEFAULT_AVATAR, alt: `${profile.name} 기본 프로필 사진` }];
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", images },
    twitter: { card: "summary", title, description, images: images.map((i) => i.url) },
  };
}

export default function PublicProfilePage({ params }: PageProps<"/[username]">) {
  return (
    <main
      {...inspect("PublicProfilePage", FILE)}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-12 sm:py-16"
    >
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile params={params} />
      </Suspense>
      <footer {...inspect("Footer", FILE)} className="mt-auto pt-12 text-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted transition hover:text-brand"
        >
          🌳 링크 나무로 만들기
        </Link>
      </footer>
    </main>
  );
}

async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const profile = await loadProfile(params);
  if (!profile) notFound();

  return (
    <>
      <section {...inspect("ProfileHeader", FILE)} className="flex flex-col items-center text-center">
        <Avatar src={profile.avatarUrl} name={profile.name} size={136} />
        <h1 {...inspect("ProfileName", FILE)} className="mt-4 text-xl font-bold">
          {profile.name}
        </h1>
        {profile.bio && (
          <p {...inspect("ProfileBio", FILE)} className="mt-2 max-w-sm text-muted">
            {profile.bio}
          </p>
        )}
      </section>

      <nav {...inspect("LinkList", FILE)} aria-label={`${profile.name}의 링크`} className="mt-8">
        {profile.links.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {profile.links.map((link) => (
              <li key={link.id}>
                <LinkCard id={link.id} title={link.title} url={link.url} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted">아직 등록된 링크가 없습니다.</p>
        )}
      </nav>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col items-center">
      <div className="h-[136px] w-[136px] rounded-full bg-border" />
      <div className="mt-4 h-6 w-32 rounded bg-border" />
      <div className="mt-3 h-4 w-48 rounded bg-border" />
      <div className="mt-8 flex w-full flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-border" />
        ))}
      </div>
    </div>
  );
}
