"use client";

import { useState, useMemo } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  ArrowLeft,
  MapPin,
  Car,
  Train,
  Bike,
  PersonStanding,
  Minus,
  Map,
  Globe,
  Layers,
  Mountain,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps/config";
import type { Trip, Place } from "@/types";
import TripMap, { type TravelMode, type MapLayerType, getDayColor } from "./TripMap";
import PlaceCard from "./PlaceCard";

interface Props {
  trip: Trip;
  places: Place[];
}

const TRAVEL_MODES: { mode: TravelMode; icon: React.ElementType; label: string }[] = [
  { mode: "DRIVING", icon: Car, label: "자동차" },
  { mode: "TRANSIT", icon: Train, label: "대중교통" },
  { mode: "BICYCLING", icon: Bike, label: "자전거" },
  { mode: "WALKING", icon: PersonStanding, label: "도보" },
  { mode: "STRAIGHT", icon: Minus, label: "일직선" },
];

const MAP_LAYERS: { type: MapLayerType; icon: React.ElementType; label: string }[] = [
  { type: "roadmap", icon: Map, label: "기본" },
  { type: "satellite", icon: Globe, label: "위성" },
  { type: "hybrid", icon: Layers, label: "하이브리드" },
  { type: "terrain", icon: Mountain, label: "지형" },
];

function computeDayCount(trip: Trip, places: Place[]): number {
  const maxDay = places.reduce((m, p) => Math.max(m, p.day), 0);
  if (trip.start_date && trip.end_date) {
    const diff =
      Math.ceil(
        (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;
    return Math.max(diff, maxDay, 1);
  }
  return Math.max(maxDay, 1);
}

export default function DemoDetailClient({ trip, places }: Props) {
  // 0 = 전체 보기, 1+ = 특정 일자
  const [selectedDay, setSelectedDay] = useState(1);
  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVING");
  const [mapLayer, setMapLayer] = useState<MapLayerType>("roadmap");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const dayCount = computeDayCount(trip, places);

  const dayPlaces = useMemo(
    () =>
      selectedDay > 0
        ? places
            .filter((p) => p.day === selectedDay)
            .sort((a, b) => a.order - b.order)
        : [],
    [places, selectedDay]
  );

  // 전체 보기용: 일자별 그룹
  const placesByDay = useMemo((): Record<number, Place[]> => {
    const result: Record<number, Place[]> = {};
    for (const p of places) {
      if (!result[p.day]) result[p.day] = [];
      result[p.day].push(p);
    }
    for (const day of Object.keys(result)) {
      result[Number(day)] = [...result[Number(day)]].sort((a, b) => a.order - b.order);
    }
    return result;
  }, [places]);

  return (
    <>
      {/* ── 데모 배너 ────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-gray-900 text-white flex items-center justify-center gap-3 px-4 py-2.5 text-xs">
        <span className="font-medium">데모 모드</span>
        <span className="text-gray-500">—</span>
        <span className="text-gray-400">
          로그인하면 나만의 여행을 만들 수 있어요
        </span>
        <Link
          href="/signup"
          className="ml-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors"
        >
          <LogIn className="w-3 h-3" />
          시작하기
        </Link>
      </div>

      {/* ── 메인 레이아웃 ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 패널 */}
        <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-hidden">
          {/* 헤더 */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-black text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              홈으로
            </Link>
            <h1 className="text-lg font-bold text-black leading-tight">
              {trip.title}
            </h1>
            {trip.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {trip.description}
              </p>
            )}
            {(trip.start_date || trip.end_date) && (
              <p className="text-gray-300 text-xs mt-2">
                {trip.start_date ?? "?"} ~ {trip.end_date ?? "?"}
              </p>
            )}
          </div>

          {/* 날짜 탭 */}
          <div className="px-3 py-2.5 border-b border-gray-100 flex gap-1 overflow-x-auto">
            {/* 전체 탭 */}
            <button
              onClick={() => setSelectedDay(0)}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedDay === 0
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-black hover:bg-gray-100"
              )}
            >
              전체
            </button>

            {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedDay === day
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      selectedDay === day ? "#ffffff" : getDayColor(day),
                  }}
                />
                Day {day}
              </button>
            ))}
          </div>

          {/* 장소 목록 (읽기 전용) */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {selectedDay === 0 ? (
              // 전체 보기
              <div className="flex flex-col gap-5">
                {Object.keys(placesByDay)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((day) => (
                    <div key={day}>
                      <div className="flex items-center gap-2 px-1 mb-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getDayColor(day) }}
                        />
                        <span className="text-xs font-semibold text-gray-500">
                          Day {day}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {placesByDay[day].map((place, i) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            index={i + 1}
                            onRemove={() => {}}
                            readOnly
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : dayPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">이 날에는 장소가 없어요</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {dayPlaces.map((place, index) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    index={index + 1}
                    onRemove={() => {}}
                    readOnly
                  />
                ))}
              </div>
            )}
          </div>

          {/* 데모 안내 */}
          <div className="px-3 py-3 border-t border-gray-100">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 text-sm font-medium transition-all"
            >
              <LogIn className="w-4 h-4" />
              로그인하고 나만의 여행 만들기
            </Link>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="flex-1 relative">
          <TripMap
            places={dayPlaces}
            backgroundPlaces={places}
            selectedDay={selectedDay}
            isLoaded={isLoaded}
            travelMode={travelMode}
            mapLayer={mapLayer}
          />

          {/* 이동 수단 선택 (상단 중앙) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-white rounded-xl border border-gray-100 shadow-lg shadow-black/5 p-1">
            {TRAVEL_MODES.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setTravelMode(mode)}
                title={label}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  travelMode === mode
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* 지도 레이어 선택 (우측 상단) */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-0.5 bg-white rounded-xl border border-gray-100 shadow-lg shadow-black/5 p-1">
            {MAP_LAYERS.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setMapLayer(type)}
                title={label}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  mapLayer === type
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
