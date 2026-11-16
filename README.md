# 🌳 링크 나무

내 모든 링크를 한 페이지에 모아 두고, 하나의 URL로 공유하는 서비스입니다. (요구사항: [PRD.md](PRD.md))

## 기술 스택

- Next.js 16 (App Router, Cache Components) + TypeScript
- Tailwind CSS v4
- MongoDB Atlas (`mongodb` 드라이버)
- 인증: 이메일·비밀번호 (bcryptjs) + JWT 세션 쿠키 (jose)

## 시작하기

1. `.env.local`에 값을 채웁니다. (`.env.example` 참고)

   | 변수 | 설명 |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas 연결 문자열 |
   | `MONGODB_DB` | 데이터베이스 이름 (기본 `linknamu`) |
   | `AUTH_SECRET` | 세션 서명용 비밀키, 32자 이상 |

2. 개발 서버 실행

   ```bash
   npm run dev
   ```

3. http://localhost:3000 → 회원가입 → `/admin`에서 프로필·링크 편집 → `/{username}` 공개 페이지 확인

## 라우트

| 경로 | 설명 |
|---|---|
| `/` | 소개(랜딩) 페이지 |
| `/signup`, `/login` | 회원가입 / 로그인 |
| `/admin` | 관리 페이지 (프로필 편집, 링크 추가·수정·삭제·순서 변경, 클릭 수, 공유 URL 복사) |
| `/{username}` | 공개 링크 페이지 (OG 태그 포함, 클릭 수 비노출) |
| `POST /api/click/{linkId}` | 클릭 수 +1 (소유자 본인 클릭 제외) |
| `GET /api/avatar/{userId}` | 프로필 사진 |

## 폴더 구조

```
src/
├─ app/                  # 페이지와 API 라우트
├─ components/           # UI 컴포넌트
├─ lib/
│  ├─ actions/           # 서버 액션 (인증, 관리 기능)
│  ├─ db.ts              # MongoDB 연결 / 컬렉션 타입
│  ├─ data.ts            # 데이터 조회 (공개 페이지는 캐시)
│  ├─ auth.ts, session.ts
│  ├─ validation.ts      # PRD 제약 조건
│  └─ link-icon.ts       # 도메인별 아이콘
└─ proxy.ts              # /admin 접근 전 로그인 확인
```

## 구현 메모

- **클릭 집계**: 카드 클릭 시 `navigator.sendBeacon`으로 비동기 전송하므로 집계가 실패해도 이동은 막히지 않습니다.
- **공개 페이지 캐시**: `"use cache"` + `cacheTag("profile:{username}")`로 캐시하고, 프로필·링크 변경 시 `updateTag`로 즉시 갱신합니다.
- **프로필 사진**: 브라우저에서 400×400 WebP로 줄인 뒤 MongoDB에 저장합니다 (원본 JPG/PNG/WebP 최대 5MB). Vercel 요청 크기 제한을 피하기 위함입니다.
- **보안**: `http(s)://` URL만 허용, 모든 서버 액션에서 세션 재검증, 세션 쿠키는 httpOnly.

## 배포 (Vercel)

Vercel 프로젝트의 Environment Variables에 `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`을 등록하고, MongoDB Atlas의 Network Access에서 Vercel 접속을 허용하세요.
