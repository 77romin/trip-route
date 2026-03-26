"use client";

import { useState, useTransition } from "react";
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

interface PlaceDetailPanelProps {
  place: Place;
  onClose: () => void;
  onUpdate: (placeId: string, data: { notes?: string; duration_minutes?: number | null; category?: PlaceCategory }) => void;
}

export default function PlaceDetailPanel({
  place,
  onClose,
  onUpdate,
}: PlaceDetailPanelProps) {
  const [notes, setNotes] = useState(place.notes ?? "");
  const [duration, setDuration] = useState(
    place.duration_minutes != null ? String(place.duration_minutes) : ""
  );
  const [category, setCategory] = useState<PlaceCategory>(place.category ?? "other");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

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
      className="absolute top-0 left-0 w-[380px] h-full bg-white border-r border-gray-100 z-30 flex flex-col shadow-xl"
    >
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-black">장소 상세</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 장소 기본 정보 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <CatIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-black font-semibold text-sm">{place.name}</h3>
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
        {/* 카테고리 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            카테고리
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  category === value
                    ? "bg-black text-white border-black"
                    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black"
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
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
            <Clock className="w-3.5 h-3.5" />
            소요시간 (분)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="예: 60"
            min={0}
            className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>

        {/* 메모 */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
            <StickyNote className="w-3.5 h-3.5" />
            메모
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="이 장소에 대한 메모를 남겨보세요..."
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all resize-none"
          />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
            saved
              ? "bg-green-500 text-white"
              : "bg-black hover:bg-gray-800 text-white disabled:opacity-50"
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
    </motion.div>
  );
}
