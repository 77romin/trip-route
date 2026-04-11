"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Star,
  Phone,
  Globe,
  ExternalLink,
  ImageOff,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapPlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  types?: string[];
  photos: string[];
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
}

interface Props {
  info: MapPlaceInfo;
  dayCount: number;
  onClose: () => void;
  /** undefined이면 추가 버튼 숨김 (공개 뷰 등) */
  onAdd?: (day: number) => void;
}

export default function MapPlacePanel({ info, dayCount, onClose, onAdd }: Props) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!onAdd) return;
    onAdd(selectedDay);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const hasInfo = info.rating || info.phone || info.website || info.mapsUrl;

  return (
    // 배경 오버레이 (클릭 시 닫힘)
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[1px]" />

      {/* 팝업 카드 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/50 w-[420px] max-h-[82vh] flex flex-col overflow-hidden z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-black dark:text-white">장소 정보</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-black dark:text-white font-semibold text-sm">{info.name}</h3>
              {info.address && (
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{info.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* 사진 */}
          {info.photos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {info.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={info.name}
                  className="h-32 w-auto flex-shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageOff className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {/* 상세 정보 */}
          {hasInfo && (
            <div className="space-y-2 rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
              {info.rating && (
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-black dark:text-white">
                    {info.rating.toFixed(1)}
                  </span>
                  {info.userRatingsTotal && (
                    <span className="text-xs text-gray-400">
                      ({info.userRatingsTotal.toLocaleString()}개 리뷰)
                    </span>
                  )}
                </div>
              )}
              {info.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{info.phone}</span>
                </div>
              )}
              {info.website && (
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate"
                  >
                    {info.website.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                </div>
              )}
              {info.mapsUrl && (
                <a
                  href={info.mapsUrl}
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
        </div>

        {/* 내 계획에 추가 */}
        {onAdd && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 space-y-3">
            <p className="text-xs text-gray-500 font-medium">몇 일차에 추가할까요?</p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    selectedDay === day
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  Day {day}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                added
                  ? "bg-green-500 text-white"
                  : "bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100"
              )}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  추가됐어요!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  내 계획에 추가하기
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
