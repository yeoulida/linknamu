type Props = {
  src: string | null;
  name: string;
  size?: number;
};

/** 원형 프로필 사진. 사진이 없으면 기본 아바타를 표시한다(F1-5). */
export default function Avatar({ src, name, size = 96 }: Props) {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${name} 기본 프로필 사진`}
        style={style}
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-brand"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3/5 w-3/5">
          <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.25c-4.14 0-7.5 2.52-7.5 5.63 0 .62.5 1.12 1.13 1.12h12.74c.62 0 1.13-.5 1.13-1.12 0-3.11-3.36-5.63-7.5-5.63Z" />
        </svg>
      </div>
    );
  }

  return (
    // 아바타는 자체 API에서 이미 리사이즈된 작은 이미지이므로 일반 img 사용
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} 프로필 사진`}
      width={size}
      height={size}
      style={style}
      className="shrink-0 rounded-full border border-border bg-surface object-cover"
    />
  );
}
