"use client";

import { useRef, useState, useMemo, useTransition } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  ArrowLeft,
  Plus,
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps/config";
import type { Trip, Place } from "@/types";
import TripMap, { type TravelMode, type MapLayerType, type DblClickPlaceInfo, getDayColor } from "./TripMap";
import PlaceSearch from "./PlaceSearch";
import PlaceCard from "./PlaceCard";
import PlaceDetailPanel from "./PlaceDetailPanel";
import MapClickConfirm from "./MapClickConfirm";
import {
  addPlace,
  removePlace,
  reorderPlaces,
  updatePlace,
} from "@/app/(dashboard)/trips/[id]/actions";

interface Props {
  trip: Trip;
  initialPlaces: Place[];
}

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

const MAP_LAYERS: {
  type: MapLayerType;
  icon: React.ElementType;
  label: string;
}[] = [
  { type: "roadmap", icon: Map, label: "기본" },
  { type: "satellite", icon: Globe, label: "위성" },
  { type: "hybrid", icon: Layers, label: "하이브리드" },
  { type: "terrain", icon: Mountain, label: "지형" },
];

function DraggablePlaceCard({
  place,
  index,
  onRemove,
  onClick,
}: {
  place: Place;
  index: number;
  onRemove: () => void;
  onClick: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={place}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      <PlaceCard
        place={place}
        index={index}
        onRemove={onRemove}
        onClick={onClick}
        dragControls={controls}
      />
    </Reorder.Item>
  );
}

export default function TripDetailClient({ trip, initialPlaces }: Props) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  // 0 = 전체 보기, 1+ = 특정 일자
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [dblClickPlace, setDblClickPlace] = useState<DblClickPlaceInfo | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVING");
  const [mapLayer, setMapLayer] = useState<MapLayerType>("roadmap");
  const [, startTransition] = useTransition();
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const dayCount = computeDayCount(trip, places);

  // 선택된 일자의 장소 (전체 보기 시 빈 배열 → TripMap 경로 계산 안 함)
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

  function handleAddPlace(
    placeData: Omit<Place, "id" | "trip_id" | "created_at">
  ) {
    const tempId = `temp-${Date.now()}`;
    const newPlace: Place = {
      ...placeData,
      id: tempId,
      trip_id: trip.id,
      created_at: new Date().toISOString(),
    };
    setPlaces((prev) => [...prev, newPlace]);
    setIsAddingPlace(false);

    startTransition(async () => {
      try {
        await addPlace(trip.id, placeData);
      } catch {
        setPlaces((prev) => prev.filter((p) => p.id !== tempId));
      }
    });
  }

  function handleDblClickPlace(info: DblClickPlaceInfo) {
    // 전체 보기(selectedDay=0)에서는 추가 불가
    if (selectedDay === 0) return;
    setDblClickPlace(info);
  }

  function handleConfirmDblClick() {
    if (!dblClickPlace || selectedDay === 0) return;
    handleAddPlace({
      name: dblClickPlace.name,
      address: dblClickPlace.address,
      lat: dblClickPlace.lat,
      lng: dblClickPlace.lng,
      day: selectedDay,
      order: dayPlaces.length,
      category: "other",
      duration_minutes: undefined,
      notes: undefined,
      google_place_id: undefined,
    });
    setDblClickPlace(null);
  }

  function handleRemovePlace(placeId: string) {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    startTransition(async () => {
      try {
        await removePlace(placeId, trip.id);
      } catch {
        setPlaces(initialPlaces);
      }
    });
  }

  function handleUpdatePlace(
    placeId: string,
    data: { notes?: string; duration_minutes?: number | null; category?: import("@/types").PlaceCategory }
  ) {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, ...data } as Place : p
      )
    );
    setSelectedPlace((prev) =>
      prev && prev.id === placeId ? { ...prev, ...data } as Place : prev
    );
    startTransition(async () => {
      try {
        await updatePlace(placeId, trip.id, data);
      } catch {
        setPlaces(initialPlaces);
      }
    });
  }

  function handleReorder(newDayPlaces: Place[]) {
    const reindexed = newDayPlaces.map((p, i) => ({ ...p, order: i }));

    setPlaces((prev) => {
      const otherDays = prev.filter((p) => p.day !== selectedDay);
      return [...otherDays, ...reindexed];
    });

    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(() => {
      const updates = reindexed.map(({ id, order }) => ({ id, order }));
      startTransition(async () => {
        try {
          await reorderPlaces(updates, trip.id);
        } catch {
          setPlaces(initialPlaces);
        }
      });
    }, 500);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* 좌측 패널 */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-black text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            내 여행
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

        {/* 장소 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {selectedDay === 0 ? (
            // 전체 보기: 일자별 그룹
            places.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">아직 장소가 없어요</p>
              </div>
            ) : (
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
                            onRemove={() => handleRemovePlace(place.id)}
                            onClick={() => setSelectedPlace(place)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )
          ) : dayPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">
                이 날에는 아직 장소가 없어요
              </p>
              <p className="text-gray-300 text-xs mt-1">
                아래 버튼으로 장소를 추가해보세요
              </p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={dayPlaces}
              onReorder={handleReorder}
              className="flex flex-col gap-2"
            >
              {dayPlaces.map((place, index) => (
                <DraggablePlaceCard
                  key={place.id}
                  place={place}
                  index={index + 1}
                  onRemove={() => handleRemovePlace(place.id)}
                  onClick={() => setSelectedPlace(place)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* 장소 추가 버튼 (전체 보기 시 숨김) */}
        {selectedDay !== 0 && (
          <div className="px-3 py-3 border-t border-gray-100">
            <button
              onClick={() => setIsAddingPlace(true)}
              disabled={!isLoaded}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {isLoaded ? "장소 추가" : "지도 로딩 중..."}
            </button>
          </div>
        )}
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
          isEditable={selectedDay > 0}
          onDblClickPlace={handleDblClickPlace}
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

        {/* 더블클릭 장소 추가 확인 팝업 */}
        <AnimatePresence>
          {dblClickPlace && (
            <MapClickConfirm
              name={dblClickPlace.name}
              address={dblClickPlace.address}
              onConfirm={handleConfirmDblClick}
              onCancel={() => setDblClickPlace(null)}
            />
          )}
        </AnimatePresence>

        {/* 장소 추가 모달 */}
        <AnimatePresence>
          {isAddingPlace && isLoaded && (
            <PlaceSearch
              day={selectedDay}
              existingCount={dayPlaces.length}
              onAdd={handleAddPlace}
              onClose={() => setIsAddingPlace(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 장소 상세 패널 */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailPanel
            key={selectedPlace.id}
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onUpdate={handleUpdatePlace}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function computeDayCount(trip: Trip, places: Place[]): number {
  const maxDayFromPlaces = places.reduce((max, p) => Math.max(max, p.day), 0);
  if (trip.start_date && trip.end_date) {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diff =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    return Math.max(diff, maxDayFromPlaces, 1);
  }
  return Math.max(maxDayFromPlaces, 1);
}
