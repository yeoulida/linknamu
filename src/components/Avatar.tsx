type Props = {
  src: string | null;
  name: string;
  size?: number;
};

/** 프로필 사진이 없을 때 보여 줄 기본 이미지 (public/default-avatar.jpg) */
export const DEFAULT_AVATAR = "/default-avatar.jpg";

/** 원형 프로필 사진. 사진이 없으면 기본 아바타를 표시한다(F1-5). */
export default function Avatar({ src, name, size = 96 }: Props) {
  const isDefault = !src;

  return (
    // 아바타는 이미 작게 줄인 이미지이므로 일반 img 사용
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? DEFAULT_AVATAR}
      alt={isDefault ? `${name} 기본 프로필 사진` : `${name} 프로필 사진`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full border border-border bg-surface object-cover"
    />
  );
}
