// F2-6: URL 도메인 기준 대표 아이콘
const ICONS: { match: string[]; icon: string; label: string }[] = [
  { match: ["instagram.com"], icon: "📷", label: "Instagram" },
  { match: ["youtube.com", "youtu.be"], icon: "▶️", label: "YouTube" },
  { match: ["github.com"], icon: "💻", label: "GitHub" },
  { match: ["x.com", "twitter.com"], icon: "𝕏", label: "X" },
  { match: ["tiktok.com"], icon: "🎵", label: "TikTok" },
  { match: ["facebook.com"], icon: "📘", label: "Facebook" },
  { match: ["threads.net", "threads.com"], icon: "🧵", label: "Threads" },
  { match: ["linkedin.com"], icon: "💼", label: "LinkedIn" },
  { match: ["blog.naver.com", "tistory.com", "velog.io", "medium.com", "brunch.co.kr", "substack.com"], icon: "✍️", label: "Blog" },
  { match: ["open.kakao.com", "pf.kakao.com"], icon: "💬", label: "Kakao" },
  { match: ["smartstore.naver.com", "shopping.naver.com", "coupang.com"], icon: "🛍️", label: "Shop" },
  { match: ["behance.net", "dribbble.com"], icon: "🎨", label: "Portfolio" },
  { match: ["notion.site", "notion.so"], icon: "📒", label: "Notion" },
  { match: ["spotify.com", "music.apple.com", "soundcloud.com"], icon: "🎧", label: "Music" },
];

export function getLinkIcon(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "🔗";
  }
  for (const entry of ICONS) {
    if (entry.match.some((d) => host === d || host.endsWith(`.${d}`))) return entry.icon;
  }
  return "🔗";
}
