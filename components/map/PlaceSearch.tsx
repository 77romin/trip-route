"use client";

import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Search,
  Coffee,
  Building2,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Circle,
  Clock,
  StickyNote,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place, PlaceCategory } from "@/types";
import Button from "@/components/ui/Button";

const CATEGORIES: {
  value: PlaceCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "attraction", label: "명소", icon: MapPin },
  { value: "restaurant", label: "식당", icon: UtensilsCrossed },
  { value: "cafe", label: "카페", icon: Coffee },
  { value: "hotel", label: "숙소", icon: Building2 },
  { value: "transport", label: "교통", icon: Car },
  { value: "shopping", label: "쇼핑", icon: ShoppingBag },
  { value: "other", label: "기타", icon: Circle },
];

interface PlaceSearchProps {
  day: number;
  existingCount: number;
  onAdd: (place: Omit<Place, "id" | "trip_id" | "created_at">) => void;
  onClose: () => void;
}

export default function PlaceSearch({
  day,
  existingCount,
  onAdd,
  onClose,
}: PlaceSearchProps) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [category, setCategory] = useState<PlaceCategory>("attraction");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");

  function handlePlaceChanged() {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (place.geometry?.location) {
      setSelectedPlace(place);
    }
  }

  function handleSubmit() {
    if (!selectedPlace?.geometry?.location) return;
    onAdd({
      name: selectedPlace.name ?? "",
      address: selectedPlace.formatted_address ?? "",
      lat: selectedPlace.geometry.location.lat(),
      lng: selectedPlace.geometry.location.lng(),
      google_place_id: selectedPlace.place_id,
      category,
      notes: notes || undefined,
      duration_minutes: duration ? parseInt(duration) : undefined,
      day,
      order: existingCount,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 flex flex-col gap-5"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-black dark:text-white font-semibold">Day {day} — 장소 추가</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 장소 검색 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1.5 block">
            장소 검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={handlePlaceChanged}
              options={{
                fields: ["name", "formatted_address", "geometry", "place_id"],
              }}
            >
              <input
                type="text"
                placeholder="장소 이름이나 주소를 입력하세요"
                className="w-full h-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </Autocomplete>
          </div>
          {selectedPlace && (
            <div className="mt-2 flex items-center gap-2 text-sm text-black dark:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{selectedPlace.name}</span>
            </div>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1.5 block">
            카테고리
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  category === value
                    ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500"
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 체류시간 + 메모 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              체류 시간 (분)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="예: 60"
              min="0"
              className="w-full h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              메모
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="간단한 메모"
              className="w-full h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2.5 justify-end pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedPlace?.geometry?.location}
          >
            추가하기
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
