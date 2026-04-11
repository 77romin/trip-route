"use client";

import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  StickyNote,
  Coffee,
  Building2,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Circle,
  Check,
  Star,
  Phone,
  Globe,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place, PlaceCategory } from "@/types";

const CATEGORY_OPTIONS: { value: PlaceCategory; icon: React.ElementType; label: string }[] = [
  { value: "attraction", icon: MapPin, label: "명소" },
  { value: "restaurant", icon: UtensilsCrossed, label: "식당" },
  { value: "cafe", icon: Coffee, label: "카페" },
  { value: "hotel", icon: Building2, label: "숙소" },
  { value: "transport", icon: Car, label: "교통" },
  { value: "shopping", icon: ShoppingBag, label: "쇼핑" },
  { value: "other", icon: Circle, label: "기타" },
];

interface GooglePlaceDetails {
  photos: string[];
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
}

interface PlaceDetailPanelProps {
  place: Place;
  onClose: () => void;
  onUpdate: (placeId: string, data: { notes?: string; duration_minutes?: number | null; category?: PlaceCategory }) => void;
  readOnly?: boolean;
  isLoaded?: boolean;
}

export default function PlaceDetailPanel({
  place,
  onClose,
  onUpdate,
  readOnly,
  isLoaded,
}: PlaceDetailPanelProps) {
  const [notes, setNotes] = useState(place.notes ?? "");
  const [duration, setDuration] = useState(
    place.duration_minutes != null ? String(place.duration_minutes) : ""
  );
  const [category, setCategory] = useState<PlaceCategory>(place.category ?? "other");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [googleDetails, setGoogleDetails] = useState<GooglePlaceDetails | null>(null);

  // Google Places API로 상세정보 조회
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined" || !window.google?.maps?.places) return;

    const div = document.createElement("div");
    const service = new window.google.maps.places.PlacesService(div);
    const FIELDS = [
      "photos",
      "rating",
      "user_ratings_total",
      "formatted_phone_number",
      "website",
      "url",
    ];

    function applyResult(result: google.maps.places.PlaceResult) {
      const photos = (result.photos ?? [])
        .slice(0, 3)
        .map((p) => p.getUrl({ maxWidth: 400, maxHeight: 300 }));
      setGoogleDetails({
        photos,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        phone: result.formatted_phone_number,
        website: result.website,
        mapsUrl: result.url,
      });
    }

    if (place.google_place_id) {
      // place_id로 직접 조회
      service.getDetails({ placeId: place.google_place_id, fields: FIELDS }, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          applyResult(result);
        }
      });
    } else {
      // place_id 없으면 이름+주소로 검색 후 조회
      const query = place.address ? `${place.name} ${place.address}` : place.name;
      service.findPlaceFromQuery(
        { query, fields: ["place_id"] },
        (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results?.[0]?.place_id
          ) {
            service.getDetails(
              { placeId: results[0].place_id!, fields: FIELDS },
              (detail, detailStatus) => {
                if (
                  detailStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                  detail
                ) {
                  applyResult(detail);
                }
              }
            );
          }
        }
      );
    }
  }, [isLoaded, place.google_place_id, place.name, place.address]);

  function handleSave() {
    const durationVal = duration ? parseInt(duration, 10) : null;
    startTransition(() => {
      onUpdate(place.id, {
        notes: notes || undefined,
        duration_minutes: isNaN(durationVal as number) ? null : durationVal,
        category,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const catConfig = CATEGORY_OPTIONS.find((c) => c.value === category) ?? CATEGORY_OPTIONS[6];
  const CatIcon = catConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 left-0 w-[380px] h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 flex flex-col shadow-xl dark:shadow-black/40"
    >
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-black dark:text-white">장소 상세</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 장소 기본 정보 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <CatIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-black dark:text-white font-semibold text-sm">{place.name}</h3>
            {place.address && (
              <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                {place.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 편집 영역 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Google Places 사진 */}
        {googleDetails && googleDetails.photos.length > 0 && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {googleDetails.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={place.name}
                  className="h-28 w-auto flex-shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}
        {googleDetails && googleDetails.photos.length === 0 && (
          <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Google Places 정보 */}
        {googleDetails && (
          <div className="space-y-2 rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
            {googleDetails.rating && (
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <span className="text-sm font-medium text-black dark:text-white">
                  {googleDetails.rating.toFixed(1)}
                </span>
                {googleDetails.userRatingsTotal && (
                  <span className="text-xs text-gray-400">
                    ({googleDetails.userRatingsTotal.toLocaleString()}개 리뷰)
                  </span>
                )}
              </div>
            )}
            {googleDetails.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{googleDetails.phone}</span>
              </div>
            )}
            {googleDetails.website && (
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <a
                  href={googleDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate"
                >
                  {googleDetails.website.replace(/^https?:\/\//, "").split("/")[0]}
                </a>
              </div>
            )}
            {googleDetails.mapsUrl && (
              <a
                href={googleDetails.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Google Maps에서 보기
              </a>
            )}
          </div>
        )}

        {/* 카테고리 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            카테고리
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => !readOnly && setCategory(value)}
                disabled={readOnly}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  category === value
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400",
                  !readOnly && category !== value && "hover:border-gray-400 dark:hover:border-gray-500 hover:text-black dark:hover:text-white",
                  readOnly && "cursor-default"
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 소요시간 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <Clock className="w-3.5 h-3.5" />
            소요시간 (분)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => !readOnly && setDuration(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly && !duration ? "미설정" : "예: 60"}
            min={0}
            className={cn(
              "w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-all",
              !readOnly && "focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700",
              readOnly && "cursor-default"
            )}
          />
        </div>

        {/* 메모 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            <StickyNote className="w-3.5 h-3.5" />
            메모
          </label>
          <textarea
            value={notes}
            onChange={(e) => !readOnly && setNotes(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly && !notes ? "메모 없음" : "이 장소에 대한 메모를 남겨보세요..."}
            rows={5}
            className={cn(
              "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-all resize-none",
              !readOnly && "focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700",
              readOnly && "cursor-default"
            )}
          />
        </div>
      </div>

      {/* 저장 버튼 (readOnly면 숨김) */}
      {!readOnly && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              saved
                ? "bg-green-500 text-white"
                : "bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50"
            )}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                저장됨
              </>
            ) : isPending ? (
              "저장 중..."
            ) : (
              "저장"
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
