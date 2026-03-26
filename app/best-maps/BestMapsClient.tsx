"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Copy, MapPin, Calendar, User, X, Frown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PublicTrip, ProfileSnippet } from "./page";
import { copyTrip, toggleLike } from "./actions";

// ── 지역 계층 구조 ─────────────────────────────────────────────
const REGION_MAP: Record<string, Record<string, string[]>> = {
  국내: {
    "서울/경기": ["서울", "경기", "인천", "수원", "고양", "성남", "용인"],
    "부산/경남": ["부산", "경남", "울산", "창원", "거제"],
    강원: ["강원", "강릉", "춘천", "속초", "원주"],
    충청: ["대전", "충북", "충남", "세종", "청주", "천안"],
    전라: ["광주", "전북", "전남", "전주", "여수", "순천"],
    경상: ["대구", "경북", "경주", "포항", "안동"],
    제주: ["제주", "서귀포"],
  },
  해외: {
    아시아: [
      "일본", "도쿄", "오사카", "교토", "후쿠오카", "삿포로",
      "태국", "방콕", "치앙마이", "싱가포르", "홍콩", "대만", "타이베이",
      "베트남", "하노이", "호치민", "다낭", "발리", "인도네시아",
      "말레이시아", "쿠알라룸푸르", "중국", "베이징", "상하이",
    ],
    유럽: [
      "프랑스", "파리", "영국", "런던", "이탈리아", "로마", "밀라노",
      "스페인", "바르셀로나", "마드리드", "독일", "베를린", "뮌헨",
      "네덜란드", "암스테르담", "스위스", "취리히", "체코", "프라하",
      "포르투갈", "리스본", "그리스", "아테네", "터키", "이스탄불",
    ],
    미주: [
      "미국", "뉴욕", "LA", "샌프란시스코", "시카고", "라스베가스",
      "하와이", "캐나다", "밴쿠버", "토론토", "멕시코", "칸쿤",
    ],
    오세아니아: [
      "호주", "시드니", "멜버른", "브리즈번", "골드코스트",
      "뉴질랜드", "오클랜드", "퀸스타운",
    ],
  },
};

type Category = "전체" | "국내" | "해외";

// ── TripCard ──────────────────────────────────────────────────
interface TripCardProps {
  trip: PublicTrip;
  rank: number;
  isLiked: boolean;
  likeCount: number;
  isCopying: boolean;
  onCopy: () => void;
  onLike: () => void;
}

function TripCard({
  trip,
  rank,
  isLiked,
  likeCount,
  isCopying,
  onCopy,
  onLike,
}: TripCardProps) {
  const profile = (
    Array.isArray(trip.profiles) ? trip.profiles[0] : trip.profiles
  ) as ProfileSnippet | null;
  const authorName = profile?.full_name ?? "익명";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min((rank - 1) * 0.04, 0.4) }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-black/5 transition-all flex flex-col overflow-hidden group"
    >
      {/* 썸네일 + 내용 (클릭 시 여행 상세로 이동) */}
      <Link href={`/trips/${trip.id}`} className="flex flex-col flex-1">
        <div className="h-36 bg-gray-100 flex items-center justify-center relative flex-shrink-0">
          <MapPin className="w-8 h-8 text-gray-200" />
          {trip.region && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-medium">
              {trip.region}
            </span>
          )}
          {rank <= 10 && (
            <span
              className={cn(
                "absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                rank === 1 && "bg-yellow-400 text-yellow-900",
                rank === 2 && "bg-gray-300 text-gray-600",
                rank === 3 && "bg-orange-300 text-orange-800",
                rank >= 4 && rank <= 10 && "bg-white/90 text-gray-700 border border-gray-200"
              )}
            >
              {rank}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-black text-base mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {trip.title}
          </h3>
          {trip.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {trip.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {authorName}
            </span>
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {trip.start_date}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 통계 + 액션 */}
      <div className="flex items-center justify-between px-5 pb-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Copy className="w-3.5 h-3.5" />
            {trip.copy_count}
          </span>
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              isLiked ? "text-black" : "text-gray-400 hover:text-black"
            )}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-all",
                isLiked && "fill-current"
              )}
            />
            {likeCount}
          </button>
        </div>
        <button
          onClick={onCopy}
          disabled={isCopying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Copy className="w-3 h-3" />
          {isCopying ? "복사 중..." : "내 것으로 복사하기"}
        </button>
      </div>
    </motion.div>
  );
}

// ── EmptyState ────────────────────────────────────────────────
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center mb-5">
        <Frown className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-black font-semibold text-lg mb-2">
        {hasFilter ? "검색 결과가 없어요" : "아직 공개된 여행이 없어요"}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs">
        {hasFilter
          ? "다른 검색어나 필터를 시도해보세요."
          : "여행을 만들고 공개하면 여기에 랭킹으로 표시돼요."}
      </p>
    </div>
  );
}

// ── BestMapsClient ────────────────────────────────────────────
interface BestMapsClientProps {
  trips: PublicTrip[];
  likedTripIds: string[];
  isLoggedIn: boolean;
}

export default function BestMapsClient({
  trips,
  likedTripIds,
  isLoggedIn,
}: BestMapsClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("전체");
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [likedIds, setLikedIds] = useState(() => new Set(likedTripIds));
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(trips.map((t) => [t.id, t.like_count]))
  );
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(
    null
  );

  function showToast(message: string, ok = true) {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function handleCategoryChange(cat: Category) {
    setCategory(cat);
    setSubcategory(null);
    setCity(null);
  }

  // ── 필터링 ──────────────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (query) {
        const q = query.toLowerCase();
        const hit =
          trip.title.toLowerCase().includes(q) ||
          (trip.region?.toLowerCase().includes(q) ?? false) ||
          (trip.description?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }

      if (category !== "전체") {
        if (!trip.region) return false;
        const r = trip.region.toLowerCase();

        if (city) {
          return r.includes(city.toLowerCase());
        }
        if (subcategory) {
          const cities = REGION_MAP[category]?.[subcategory] ?? [];
          return cities.some((c) => r.includes(c.toLowerCase()));
        }
        const allCities = Object.values(REGION_MAP[category] ?? {}).flat();
        return allCities.some((c) => r.includes(c.toLowerCase()));
      }

      return true;
    });
  }, [trips, query, category, subcategory, city]);

  // ── 복사 ─────────────────────────────────────────────────────
  async function handleCopy(tripId: string) {
    if (!isLoggedIn) {
      showToast("로그인이 필요한 기능입니다.", false);
      return;
    }
    setCopyingId(tripId);
    const result = await copyTrip(tripId);
    setCopyingId(null);
    if (result.error) {
      showToast(result.error, false);
    } else {
      showToast("내 여행으로 복사했어요!");
      router.push(`/trips/${result.newTripId}`);
    }
  }

  // ── 좋아요 (낙관적 업데이트) ──────────────────────────────────
  async function handleLike(tripId: string) {
    if (!isLoggedIn) {
      showToast("로그인이 필요한 기능입니다.", false);
      return;
    }
    const wasLiked = likedIds.has(tripId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(tripId) : next.add(tripId);
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] ?? 0) + (wasLiked ? -1 : 1),
    }));

    const result = await toggleLike(tripId);
    if (result.error) {
      // 롤백
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(tripId) : next.delete(tripId);
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [tripId]: (prev[tripId] ?? 0) + (wasLiked ? 1 : -1),
      }));
      showToast(result.error, false);
    }
  }

  const subcategories =
    category !== "전체" ? Object.keys(REGION_MAP[category] ?? {}) : [];
  const cities =
    subcategory && category !== "전체"
      ? (REGION_MAP[category]?.[subcategory] ?? [])
      : [];

  const hasFilter = !!query || category !== "전체";

  return (
    <>
      {/* ── 헤더 · 검색 ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-black mb-2">최고의 지도</h1>
            <p className="text-gray-400 mb-8">
              가장 많이 복사된 여행 계획을 찾아보세요
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative max-w-xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="지역, 여행 제목으로 검색 (예: 서울, 파리, 제주)"
              className="w-full pl-11 pr-10 h-12 rounded-xl border border-gray-200 bg-gray-50 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── 지역 필터 ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 space-y-2">
          {/* 대분류 */}
          <div className="flex gap-1">
            {(["전체", "국내", "해외"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  category === cat
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 중분류 */}
          <AnimatePresence>
            {subcategories.length > 0 && (
              <motion.div
                key="subcategory"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pb-1 flex-wrap">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSubcategory(sub === subcategory ? null : sub);
                        setCity(null);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                        subcategory === sub
                          ? "bg-black text-white border-black"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 소분류 */}
          <AnimatePresence>
            {cities.length > 0 && (
              <motion.div
                key="cities"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-1.5 pb-1 flex-wrap">
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c === city ? null : c)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-xs border transition-all",
                        city === c
                          ? "bg-gray-800 text-white border-gray-800"
                          : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 결과 목록 ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-400 text-sm mb-6">
          {filteredTrips.length}개의 여행 계획
        </p>

        {filteredTrips.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                rank={i + 1}
                isLiked={likedIds.has(trip.id)}
                likeCount={likeCounts[trip.id] ?? trip.like_count}
                isCopying={copyingId === trip.id}
                onCopy={() => handleCopy(trip.id)}
                onLike={() => handleLike(trip.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 토스트 ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap pointer-events-none",
              toast.ok ? "bg-black/90 text-white" : "bg-red-500 text-white"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
