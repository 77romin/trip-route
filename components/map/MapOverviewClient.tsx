"use client";

import { useState, useMemo, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Map, MapPin, ArrowRight, CalendarDays, Car, Train, Bike, PersonStanding, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps/config";
import type { Place, Trip } from "@/types";
import TripMap, { type TravelMode, getDayColor } from "./TripMap";

const TRAVEL_MODES: {
  mode: TravelMode;
  icon: React.ElementType;
  label: string;
}[] = [
  { mode: "DRIVING", icon: Car, label: "자동차" },
  { mode: "TRANSIT", icon: Train, label: "대중교통" },
  { mode: "BICYCLING", icon: Bike, label: "자전거" },
  { mode: "WALKING", icon: PersonStanding, label: "도보" },
  { mode: "STRAIGHT", icon: Minus, label: "일직선" },
];

type TripSummary = Pick<Trip, "id" | "title" | "start_date" | "end_date" | "region">;

interface Props {
  trips: TripSummary[];
  places: Place[];
}

export default function MapOverviewClient({ trips, places }: Props) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    trips[0]?.id ?? null
  );
  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVING");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setPanelOpen(window.innerWidth >= 768);
  }, []);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // 선택된 여행의 장소 (일자·순서 정렬)
  const tripPlaces = useMemo(
    () =>
      selectedTripId
        ? places
            .filter((p) => p.trip_id === selectedTripId)
            .sort((a, b) => a.day - b.day || a.order - b.order)
        : [],
    [places, selectedTripId]
  );

  // 해당 여행에 존재하는 일자 목록
  const existingDays = useMemo(
    () => [...new Set(tripPlaces.map((p) => p.day))].sort((a, b) => a - b),
    [tripPlaces]
  );

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* ── 좌측: 여행 목록 ───────────────────────────────────── */}
      <motion.div
        animate={{ width: panelOpen ? 288 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="flex-shrink-0 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-base font-bold text-black dark:text-white">한눈에 보기</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            여행을 선택해 전체 동선을 확인하세요
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
              <Map className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
              <p className="text-gray-400 text-xs">여행이 없어요</p>
              <Link
                href="/trips/new"
                className="text-black dark:text-white text-xs mt-2 hover:underline font-medium"
              >
                여행 만들기
              </Link>
            </div>
          ) : (
            trips.map((trip) => {
              const isSelected = selectedTripId === trip.id;
              return (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={cn(
                    "w-full text-left px-3.5 py-3 rounded-xl transition-all border",
                    isSelected
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <p className="text-sm font-semibold truncate">{trip.title}</p>
                  {(trip.start_date || trip.end_date) && (
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs mt-1",
                        isSelected ? "text-white/60 dark:text-black/60" : "text-gray-400"
                      )}
                    >
                      <CalendarDays className="w-3 h-3 flex-shrink-0" />
                      {trip.start_date ?? "?"} ~ {trip.end_date ?? "?"}
                    </p>
                  )}
                  {trip.region && (
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs mt-0.5",
                        isSelected ? "text-white/60 dark:text-black/60" : "text-gray-400"
                      )}
                    >
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {trip.region}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* 편집 바로가기 */}
        {selectedTripId && (
          <div className="px-3 py-3 border-t border-gray-100">
            <Link
              href={`/trips/${selectedTripId}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-all"
            >
              여행 편집하기
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── 지도 ─────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {/* 사이드바 토글 버튼 — 항상 표시 */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-16 bg-white dark:bg-gray-900 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-md"
        >
          {panelOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>
        {/* selectedDay=0: 전체 보기 모드 — 각 일자별 색상 직선 폴리라인 */}
        <TripMap
          places={[]}
          backgroundPlaces={tripPlaces}
          selectedDay={0}
          isLoaded={isLoaded}
          travelMode={travelMode}
        />

        {/* 이동수단 선택 (상단 중앙) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/5 dark:shadow-black/30 p-1">
          {TRAVEL_MODES.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              title={label}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                travelMode === mode
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Day 범례 */}
        {existingDays.length > 0 && (
          <div className="absolute bottom-6 left-4 z-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/5 dark:shadow-black/30 px-3.5 py-2.5">
            <p className="text-gray-400 text-xs font-medium mb-2">일자별 동선</p>
            <div className="flex flex-col gap-1.5">
              {existingDays.map((day) => {
                const dayPlaces = tripPlaces.filter((p) => p.day === day);
                return (
                  <div key={day} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getDayColor(day) }}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Day {day}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dayPlaces.length}곳
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
