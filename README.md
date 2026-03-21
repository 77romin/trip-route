# TripRoute 🗺️
> **"나의 여행? 너의 여행! 우리의 여행."**  
> 내가 만든 동선을 공유하고, 검증된 루트를 그대로 따라가 보세요.

## 프로젝트 소개
TripRoute는 여행 동선을 직접 짜고, 다른 사람의 여행 계획을 참고하거나 그대로 복사해서 활용할 수 있는 웹 애플리케이션입니다.  
혼자 여행 계획을 세우는 도구이자, 검증된 여행 루트를 나누는 커뮤니티입니다.

---

## 핵심 차별점
- 🗺️ **동선 한눈에 보기** — Google Maps 위에서 여행 루트를 시각적으로 확인
- 📋 **원클릭 복사** — 다른 사람의 여행 계획을 내 것으로 바로 가져오기
- 🏆 **랭킹 시스템** — 복사 횟수 우선, 동률 시 좋아요 수로 지역별 순위 산정

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Backend / DB | Supabase (PostgreSQL, RLS, Realtime) |
| 인증 | Supabase Auth (Google OAuth) |
| 지도 | Google Maps JavaScript API, Places API, Directions API |
| 배포 | Vercel |
| 개발 도구 | Claude Code (AI 코딩 에이전트) |

---

## 구현 기능

### 🔐 인증
- Google 계정으로 소셜 로그인
- 로그인 없이도 모든 기능 사용 가능 (단, 저장 불가)

### 🗺️ 지도 & 동선
- Google Maps 기반 실시간 동선 시각화
- 이동 수단 선택: 자동차 / 대중교통 / 자전거 / 도보 / 일직선
- 지도 레이어 변경: 기본 / 위성 / 하이브리드 / 지형
- 일자별 색상 구분 (무지개 색 순환)
- 지도 더블클릭으로 장소 추가

### 📝 여행 계획
- 여행 생성 / 수정 / 삭제
- 장소 추가 (Google Places Autocomplete 검색)
- 드래그 앤 드롭으로 장소 순서 변경
- 각 장소별 카테고리 / 메모 / 체류시간 입력
- 일자(Day)별 일정 관리

### 👥 소셜 기능
- 여행 계획 공개 / 비공개 설정
- 다른 사람의 여행 계획 원클릭 복사
- 좋아요 기능
- 지역별 랭킹 (복사 횟수 우선, 좋아요 수 차순)

### 📱 페이지 구성
- **홈** — 랜딩 페이지, 데모 체험
- **나의 지도** — 내가 만든 여행 계획 아카이브
- **최고의 지도** — 지역별 인기 여행 루트 랭킹
- **한눈에 보기** — 전체 여행을 지도 위에서 한 번에 확인
- **사용법** — 앱 사용 가이드 (애니메이션)

---

## 개발 과정에서 겪은 난관과 극복

### 1. Claude Code 설치 및 환경 설정
**문제:** OAuth 토큰 만료 에러, npm / native 이중 설치로 인한 충돌, PATH 미등록  
**극복:** `claude logout` 으로 재인증, npm 버전 제거 후 native 버전으로 통일, `~/.zshrc`에 PATH 수동 등록

### 2. Supabase 스키마 불일치
**문제:** `region` 컬럼이 DB에 없어 여행 생성 시 오류 발생  
**극복:** Supabase SQL Editor에서 `ALTER TABLE trips ADD COLUMN IF NOT EXISTS region text;` 실행

### 3. React Hooks 순서 위반
**문제:** 일자별 색상 구분 기능 추가 후 `Rendered more hooks than during the previous render` 에러 발생  
**극복:** `useMemo` 내부의 조건부 `return` 제거, Hooks 규칙에 맞게 로직 리팩토링

### 4. Google Maps Directions API 제약
**문제:** 대중교통(TRANSIT) 모드는 경유지가 2개 초과 시 에러 발생  
**극복:** 장소 3개 이상일 때 구간별 분리 계산 또는 직선 폴백 처리로 해결

### 5. Vercel 배포 후 500 에러
**문제:** 로컬 `.env.local`의 환경변수가 Vercel에 없어 `MIDDLEWARE_INVOCATION_FAILED` 에러  
**극복:** Vercel 대시보드 → Settings → Environment Variables에 키 3개 등록 후 재배포

### 6. 외부 공유 (Tailscale Funnel)
**문제:** localhost는 외부에서 접근 불가, Tailscale Funnel 활성화 필요  
**극복:** Vercel로 정식 배포하여 영구 공개 URL 확보

---

## 로컬 실행 방법

```bash
git clone https://github.com/bighead0831/trip-route.git
cd trip-route
npm install
```

`.env.local` 파일 생성 후 아래 값 입력:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

```bash
npm run dev
```

---

## 배포
🌐 [https://triproute.vercel.app](https://triproute.vercel.app)

---

## 개발 환경
- MacBook Air 15 M3
- Claude Code (AI 코딩 에이전트 터미널)
- 개발 기간: 2026년 3월 (1일)
