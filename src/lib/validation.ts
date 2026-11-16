// PRD 4장·5.3장 제약 조건
export const LIMITS = {
  nameMax: 30,
  bioMax: 80,
  linkTitleMax: 50,
  linksPerUser: 30,
  avatarSourceMaxBytes: 5 * 1024 * 1024, // 원본 사진 최대 5MB
  avatarStoredMaxBytes: 1024 * 1024, // 브라우저에서 리사이즈 후 저장되는 크기 상한
  passwordMin: 8,
} as const;

export const AVATAR_SOURCE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

// 앱 라우트와 겹치거나 오해 소지가 있는 username
const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "signup",
  "register",
  "settings",
  "about",
  "help",
  "static",
  "public",
  "_next",
  "favicon",
  "robots",
  "sitemap",
  "linknamu",
]);

export function validateUsername(raw: string): string | null {
  if (!USERNAME_PATTERN.test(raw)) {
    return "username은 영문 소문자·숫자·_ 조합 3~20자여야 합니다.";
  }
  if (RESERVED_USERNAMES.has(raw)) {
    return "사용할 수 없는 username입니다.";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  if (raw.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return "올바른 이메일 주소를 입력하세요.";
  }
  return null;
}

/** http/https URL만 허용 (javascript:, data: 등 위험 스킴 차단) */
export function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function charLength(value: string): number {
  return [...value].length;
}

export function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}
