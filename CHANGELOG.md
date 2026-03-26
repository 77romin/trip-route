# TripRoute 개선 리포트

## 개요

TripRoute 프로젝트에서 발견된 6가지 문제점을 분석하고, 각각에 대한 해결법을 설계·구현한 기록입니다.

---

## 문제 1. 전체 보기 탭에서 경로 선택 불가

### 문제점
- '전체 보기' 탭(selectedDay=0)에서 **직선 동선만 표시**됨
- 자동차, 대중교통, 도보 등 이동수단을 선택해도 반영되지 않음

### 원인
- `TripDetailClient.tsx`에서 전체 보기 시 `dayPlaces`를 빈 배열(`[]`)로 전달
- `TripMap.tsx`가 빈 배열을 받으면 경로 계산 자체를 건너뜀
- 전체 보기 렌더링에서 `Polyline`(직선)만 사용하고 `DirectionsRenderer`를 사용하지 않음

### 해결법
- `TripMap.tsx`에 **`multiDayDirections`** 상태를 추가하여, 전체 보기 시 각 일자별로 독립적인 경로를 계산
- 전체 보기 렌더링에서 `DirectionsRenderer`를 사용하여 실제 경로를 표시하고, 실패한 구간만 직선 fallback

### 변경 파일
| 파일 | 변경 내용 |
|---|---|
| `components/map/TripMap.tsx` | `multiDayDirections` 상태 추가, 전체 보기용 경로 계산 `useEffect` 추가, 렌더링 로직에 `DirectionsRenderer` 적용 |

---

## 문제 2. 대중교통 외 이동수단 경로 미표시

### 문제점
- 대중교통을 제외한 자동차, 자전거, 도보 선택 시 **직선으로만 표시**됨
- Google Maps API에서 경로를 찾지 못하면 전체가 직선으로 fallback

### 원인
- 기존 코드: TRANSIT만 구간별 분할(A→B, B→C), 나머지는 **단일 요청**(A→B→C→D 전체)
- 단일 요청 방식은 해외 경로, 장거리, 바다 건너기 등에서 `ZERO_RESULTS`를 반환하면 **전체가 직선으로 표시**

### 해결법
- **모든 이동수단**에 대해 구간별 분할 방식 적용 (TRANSIT과 동일한 방식)
- 개별 구간이 실패하면 **해당 구간만 직선**, 나머지는 실제 경로 표시
- 기존 단일 요청(waypoints 포함) 방식 제거

### 변경 파일
| 파일 | 변경 내용 |
|---|---|
| `components/map/TripMap.tsx` | 경로 계산 `useEffect`를 구간별 분할 방식으로 전면 교체 |

### 개선 전후 비교
```
[개선 전]  서울 → 부산 → 제주 (자동차)
           API 실패 → 전체 직선 ─────────────

[개선 후]  서울 → 부산 → 제주 (자동차)
           서울→부산 성공 ═══════  부산→제주 실패 ─────
           (실제 경로)             (직선 fallback)
```

---

## 문제 3. 장소 클릭 시 상세정보/메모 없음

### 문제점
- 각 일자별 장소를 클릭해도 **아무 반응 없음**
- 장소에 대한 상세 정보 확인 및 메모 작성 불가

### 해결법
- **PlaceDetailPanel** 컴포넌트 신규 생성
  - 장소명, 주소, 카테고리 표시
  - **카테고리, 소요시간, 메모 편집** 가능
  - 저장 버튼으로 서버에 반영
- `PlaceCard`에 `onClick` 핸들러 추가
- `updatePlace` 서버 액션 추가

### 변경 파일
| 파일 | 변경 내용 |
|---|---|
| `components/map/PlaceDetailPanel.tsx` | **신규 생성** — 장소 상세/편집 패널 |
| `components/map/PlaceCard.tsx` | `onClick` prop 추가, 클릭 가능 스타일 적용 |
| `components/map/TripDetailClient.tsx` | `selectedPlace` 상태, `handleUpdatePlace` 함수, `PlaceDetailPanel` 렌더링 추가 |
| `app/(dashboard)/trips/[id]/actions.ts` | `updatePlace` 서버 액션 추가 |

---

## 문제 4. 프로필 사진 변경 불가

### 문제점
- 설정 페이지에서 이름과 비밀번호만 변경 가능
- **프로필 사진 업로드/수정 기능 없음**

### 해결법
- 프로필 섹션 상단에 **아바타 미리보기 + 파일 업로드 버튼** 추가
  - 원형 아바타 위에 호버 시 카메라 아이콘 표시
  - 클릭하면 파일 선택 다이얼로그 열림
- **Supabase Storage** `avatars` 버킷에 이미지 업로드
- 업로드 후 public URL을 `user_metadata.avatar_url`에 저장
- 파일 제한: **2MB 이하**, jpg/png/gif/webp만 허용

### 변경 파일
| 파일 | 변경 내용 |
|---|---|
| `app/(dashboard)/settings/actions.ts` | `uploadAvatar` 서버 액션 추가 |
| `app/(dashboard)/settings/SettingsForm.tsx` | 아바타 업로드 UI 추가 (`avatarUrl` prop, 파일 입력, 미리보기) |
| `app/(dashboard)/settings/page.tsx` | `avatarUrl`을 서버에서 가져와 `SettingsForm`에 전달 |

### 사전 설정 필요
> Supabase Dashboard → Storage → `avatars` 버킷 생성 → Public 설정

---

## 문제 5. '최고의 지도' 데이터 부재

### 문제점
- '최고의 지도' 탭에 **어떠한 데이터도 없음**
- 사용자가 기능의 목적과 사용법을 파악하기 어려움

### 해결법
- **12개의 예제 여행** 시드 데이터 생성 (`supabase/seed.sql`)
- 다양한 도시 × 다양한 테마로 구성
- 각 여행에 **실제 GPS 좌표**, **실제 장소명**, **유용한 메모** 포함

### 시드 데이터 목록
| 순위 | 여행 | 테마 | 일정 | 복사수 | 좋아요 |
|---:|---|---|---|---:|---:|
| 1 | 도쿄 2박 3일 | 맛집 투어 | 3일 9곳 | 189 | 287 |
| 2 | 파리 4박 5일 | 명소 완전정복 | 5일 14곳 | 156 | 342 |
| 3 | 오사카 2박 3일 | 먹방 여행 | 3일 8곳 | 145 | 278 |
| 4 | 부산 2박 3일 | 카페 & 바다 | 3일 8곳 | 134 | 256 |
| 5 | 제주 2박 3일 | 자연 힐링 | 3일 8곳 | 112 | 234 |
| 6 | 로마 3박 4일 | 역사 유적 | 4일 11곳 | 98 | 189 |
| 7 | 서울 2박 3일 | 힙플레이스 | 3일 9곳 | 87 | 198 |
| 8 | 바르셀로나 3박 4일 | 가우디 건축 | 4일 10곳 | 76 | 167 |
| 9 | 방콕 2박 3일 | 맛집 & 야시장 | 3일 8곳 | 67 | 145 |
| 10 | 런던 3박 4일 | 명소 & 카페 | 4일 10곳 | 54 | 123 |
| 11 | 다낭 2박 3일 | 리조트 힐링 | 3일 7곳 | 43 | 98 |
| 12 | 프라하 2박 3일 | 중세 도시 산책 | 3일 8곳 | 34 | 87 |

### 생성 파일
| 파일 | 내용 |
|---|---|
| `supabase/seed.sql` | 시스템 사용자 + 12개 여행 + 120개 이상 장소 INSERT 문 |

### 실행 방법
> Supabase Dashboard → SQL Editor → `seed.sql` 내용 붙여넣기 → Run

---

## 문제 6. 좋아요/복사하기 미작동 + 랭킹 미표시

### 문제점
- '좋아요' 버튼과 '복사하기' 버튼의 **DB 반영이 불완전**
  - `toggleLike`: `trip_likes` 테이블만 조작하고 `trips.like_count`를 갱신하지 않음
  - `copyTrip`: `increment_trip_copy_count` RPC에 의존 (DB에 없을 수 있음)
- 랭킹 배지가 1~3위까지만 표시

### 해결법
- **toggleLike**: `trip_likes` 조작 후 `trips.like_count`를 **직접 UPDATE**
- **copyTrip**: RPC 의존 제거, `trips.copy_count`를 **직접 UPDATE**
- 랭킹 배지를 **1~10위까지 확장**
  - 1위: 금색, 2위: 은색, 3위: 동색
  - 4~10위: 흰색 배경 + 테두리

### 변경 파일
| 파일 | 변경 내용 |
|---|---|
| `app/best-maps/actions.ts` | `toggleLike`에 `like_count` 직접 갱신 추가, `copyTrip`에서 RPC 제거 후 `copy_count` 직접 갱신 |
| `app/best-maps/BestMapsClient.tsx` | 랭킹 배지 조건을 `rank <= 3`에서 `rank <= 10`으로 확장, 4~10위 스타일 추가 |

---

## 전체 변경 파일 목록

| # | 파일 경로 | 상태 |
|---|---|---|
| 1 | `components/map/TripMap.tsx` | 수정 |
| 2 | `components/map/PlaceCard.tsx` | 수정 |
| 3 | `components/map/PlaceDetailPanel.tsx` | **신규** |
| 4 | `components/map/TripDetailClient.tsx` | 수정 |
| 5 | `app/(dashboard)/trips/[id]/actions.ts` | 수정 |
| 6 | `app/(dashboard)/settings/page.tsx` | 수정 |
| 7 | `app/(dashboard)/settings/SettingsForm.tsx` | 수정 |
| 8 | `app/(dashboard)/settings/actions.ts` | 수정 |
| 9 | `app/best-maps/actions.ts` | 수정 |
| 10 | `app/best-maps/BestMapsClient.tsx` | 수정 |
| 11 | `supabase/seed.sql` | **신규** |
