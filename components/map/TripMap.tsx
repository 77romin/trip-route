"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleMap, Marker, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import {
  GOOGLE_MAPS_DEFAULT_CENTER,
  GOOGLE_MAPS_DEFAULT_ZOOM,
  GOOGLE_MAPS_LIGHT_STYLE,
} from "@/lib/google-maps/config";
import type { Place } from "@/types";

export type TravelMode = "DRIVING" | "TRANSIT" | "BICYCLING" | "WALKING" | "STRAIGHT";
export type MapLayerType = "roadmap" | "satellite" | "hybrid" | "terrain";

export interface DblClickPlaceInfo {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

export const DAY_COLORS = [
  "#FF4444",
  "#FF8C00",
  "#FFD700",
  "#32CD32",
  "#1E90FF",
  "#4B0082",
  "#9400D3",
];

export function getDayColor(day: number): string {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

interface TripMapProps {
  /** 활성 일자 장소 (경로 계산용). selectedDay=0(전체)일 때는 빈 배열. */
  places: Place[];
  /** 전체 장소 (multi-day 마커·배경 폴리라인 렌더링용) */
  backgroundPlaces?: Place[];
  /** 0=전체 보기, 1+=특정 일자, undefined=단일 모드(하위 호환) */
  selectedDay?: number;
  isLoaded: boolean;
  travelMode: TravelMode;
  mapLayer?: MapLayerType;
  /** true면 더블클릭으로 장소 추가 가능 (지도 더블클릭 줌도 비활성) */
  isEditable?: boolean;
  /** 더블클릭 위치 Geocoding 완료 후 호출 */
  onDblClickPlace?: (info: DblClickPlaceInfo) => void;
}

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

function fetchRoute(
  service: google.maps.DirectionsService,
  request: google.maps.DirectionsRequest
): Promise<{
  result: google.maps.DirectionsResult | null;
  status: google.maps.DirectionsStatus;
}> {
  return new Promise((resolve) => {
    service.route(request, (result, status) => {
      resolve({
        result: status === google.maps.DirectionsStatus.OK ? result : null,
        status,
      });
    });
  });
}

function getErrorMessage(status: google.maps.DirectionsStatus): string {
  switch (status) {
    case google.maps.DirectionsStatus.ZERO_RESULTS:
      return "선택한 이동 수단으로 경로를 찾을 수 없어요.";
    case google.maps.DirectionsStatus.NOT_FOUND:
      return "출발지 또는 목적지를 찾을 수 없어요.";
    case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
      return "경유지가 너무 많아요.";
    default:
      return "경로를 불러오지 못했어요. 직선으로 표시해요.";
  }
}

export default function TripMap({
  places,
  backgroundPlaces,
  selectedDay,
  isLoaded,
  travelMode,
  mapLayer = "roadmap",
  isEditable = false,
  onDblClickPlace,
}: TripMapProps) {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [segmentDirections, setSegmentDirections] = useState<
    (google.maps.DirectionsResult | null)[]
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      styles: mapLayer === "roadmap" ? GOOGLE_MAPS_LIGHT_STYLE : undefined,
      mapTypeId: mapLayer,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      // 편집 모드에서는 더블클릭 줌 비활성화 (더블클릭으로 장소 추가 사용)
      disableDoubleClickZoom: isEditable,
    }),
    [mapLayer, isEditable]
  );

  // 더블클릭 → Geocoding → 콜백
  function handleMapDblClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng || !onDblClickPlace) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        const addr = result.formatted_address;
        // 구체적인 명칭이 있으면 우선 사용
        const nameComp = result.address_components.find((c) =>
          c.types.some((t) =>
            ["premise", "establishment", "natural_feature", "park", "sublocality_level_2"].includes(t)
          )
        );
        const name = nameComp?.long_name ?? addr.split(",")[0].trim();
        onDblClickPlace({ lat, lng, address: addr, name });
      } else {
        onDblClickPlace({
          lat,
          lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          name: "선택한 위치",
        });
      }
    });
  }

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 장소 순서/목록 변경 감지용 안정 키 (ID + 좌표 순서 기반)
  const placesRouteKey = useMemo(
    () => places.map((p) => `${p.id}:${p.lat}:${p.lng}`).join(","),
    [places]
  );

  // 경로 계산 (활성 일자 places 기준)
  useEffect(() => {
    let cancelled = false;

    // 이전 경로를 즉시 제거 — 재계산 전까지 직선 fallback이 표시됨
    setDirections(null);
    setSegmentDirections([]);

    if (!isLoaded || travelMode === "STRAIGHT" || places.length < 2) {
      return;
    }

    const service = new google.maps.DirectionsService();

    // TRANSIT: 경유지 미지원 → 구간별 분할
    if (travelMode === "TRANSIT" && places.length > 2) {
      const fetchAll = async () => {
        const results = await Promise.all(
          places.slice(0, -1).map((from, i) =>
            fetchRoute(service, {
              origin: { lat: from.lat, lng: from.lng },
              destination: { lat: places[i + 1].lat, lng: places[i + 1].lng },
              travelMode: google.maps.TravelMode.TRANSIT,
            })
          )
        );

        if (cancelled) return;

        const dirResults = results.map((r) => r.result);
        const failedCount = dirResults.filter((r) => r === null).length;

        if (failedCount === dirResults.length) {
          setToastMessage("대중교통 경로를 찾지 못했어요. 직선으로 표시해요.");
        } else if (failedCount > 0) {
          setToastMessage(
            `${failedCount}개 구간은 대중교통 경로가 없어 직선으로 표시했어요.`
          );
        }

        setSegmentDirections(dirResults);
        setDirections(null);
      };

      fetchAll();
      return () => {
        cancelled = true;
      };
    }

    // 그 외: 경유지 포함 단일 요청
    const origin = { lat: places[0].lat, lng: places[0].lng };
    const destination = {
      lat: places[places.length - 1].lat,
      lng: places[places.length - 1].lng,
    };
    const waypoints = places.slice(1, -1).map((p) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }));

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode[travelMode],
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (cancelled) return;
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setSegmentDirections([]);
        } else {
          setDirections(null);
          setSegmentDirections([]);
          setToastMessage(getErrorMessage(status));
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [isLoaded, travelMode, placesRouteKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // backgroundPlaces를 일자별로 그룹화 (early return 전에 위치해야 훅 순서 고정)
  const placesByDay = useMemo((): Record<number, Place[]> => {
    const result: Record<number, Place[]> = {};
    for (const p of backgroundPlaces ?? []) {
      if (!result[p.day]) result[p.day] = [];
      result[p.day].push(p);
    }
    for (const day of Object.keys(result)) {
      result[Number(day)] = [...result[Number(day)]].sort((a, b) => a.order - b.order);
    }
    return result;
  }, [backgroundPlaces]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const allDisplayPlaces = backgroundPlaces ?? places;
  const center =
    places.length > 0
      ? { lat: places[0].lat, lng: places[0].lng }
      : allDisplayPlaces.length > 0
      ? { lat: allDisplayPlaces[0].lat, lng: allDisplayPlaces[0].lng }
      : GOOGLE_MAPS_DEFAULT_CENTER;

  const isSatellite = mapLayer === "satellite" || mapLayer === "hybrid";

  // multi-day 모드 여부
  const isMultiDay = backgroundPlaces !== undefined && selectedDay !== undefined;

  // 활성 일자 색상
  const activeDayColor =
    selectedDay && selectedDay > 0 ? getDayColor(selectedDay) : "#000000";

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={GOOGLE_MAPS_DEFAULT_ZOOM}
        options={mapOptions}
        onDblClick={isEditable ? handleMapDblClick : undefined}
      >
        {isMultiDay ? (
          <>
            {/* ── 배경 폴리라인 (일자별 직선) ──────────────────────── */}
            {Object.keys(placesByDay).map((key) => {
              const day = Number(key);
              const dayPlaces = placesByDay[day];
              if (dayPlaces.length < 2) return null;
              const color = getDayColor(day);
              const isAllView = selectedDay === 0;
              const isActive = selectedDay === day;

              if (isAllView) {
                return (
                  <Polyline
                    key={`poly-${day}`}
                    path={dayPlaces.map((p) => ({ lat: p.lat, lng: p.lng }))}
                    options={{
                      strokeColor: color,
                      strokeOpacity: 0.7,
                      strokeWeight: 3,
                      geodesic: true,
                    }}
                  />
                );
              }

              if (!isActive) {
                return (
                  <Polyline
                    key={`poly-${day}`}
                    path={dayPlaces.map((p) => ({ lat: p.lat, lng: p.lng }))}
                    options={{
                      strokeColor: color,
                      strokeOpacity: 0.2,
                      strokeWeight: 2,
                      geodesic: true,
                    }}
                  />
                );
              }

              return null; // 활성 일자는 DirectionsRenderer가 처리
            })}

            {/* ── 마커 (일자별 색상) ─────────────────────────────────── */}
            {Object.keys(placesByDay).map((key) =>
              placesByDay[Number(key)].map((place, i) => {
                const day = Number(key);
                const color = getDayColor(day);
                const isAllView = selectedDay === 0;
                const isActive = selectedDay === day;
                const scale = isAllView ? 12 : isActive ? 14 : 10;
                const fillOpacity = isAllView ? 0.9 : isActive ? 1 : 0.35;
                const labelColor = isSatellite ? "#000000" : "#ffffff";

                return (
                  <Marker
                    key={place.id}
                    position={{ lat: place.lat, lng: place.lng }}
                    label={{
                      text: String(i + 1),
                      color: labelColor,
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale,
                      fillColor: color,
                      fillOpacity,
                      strokeColor: "#ffffff",
                      strokeWeight: 1.5,
                    }}
                    title={place.name}
                    zIndex={isActive ? 10 : 1}
                  />
                );
              })
            )}

            {/* ── 활성 일자 DirectionsService 경로 ──────────────────── */}
            {selectedDay !== undefined && selectedDay > 0 && (
              <>
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: activeDayColor,
                        strokeOpacity: 0.85,
                        strokeWeight: 4,
                        geodesic: true,
                      },
                    }}
                  />
                )}

                {segmentDirections.map((dir, i) =>
                  dir ? (
                    <DirectionsRenderer
                      key={i}
                      directions={dir}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: activeDayColor,
                          strokeOpacity: 0.85,
                          strokeWeight: 4,
                          geodesic: true,
                        },
                      }}
                    />
                  ) : (
                    <Polyline
                      key={i}
                      path={[
                        { lat: places[i].lat, lng: places[i].lng },
                        { lat: places[i + 1].lat, lng: places[i + 1].lng },
                      ]}
                      options={{
                        strokeColor: activeDayColor,
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        geodesic: true,
                      }}
                    />
                  )
                )}

                {!directions && segmentDirections.length === 0 && places.length > 1 && (
                  <Polyline
                    path={places.map((p) => ({ lat: p.lat, lng: p.lng }))}
                    options={{
                      strokeColor: activeDayColor,
                      strokeOpacity: 0.55,
                      strokeWeight: 3,
                      geodesic: true,
                    }}
                  />
                )}
              </>
            )}
          </>
        ) : (
          // ── 단일 모드 (하위 호환) ──────────────────────────────────
          <>
            {places.map((place, i) => {
              const markerFillColor = isSatellite ? "#ffffff" : "#000000";
              const markerLabelColor = isSatellite ? "#000000" : "#ffffff";
              const markerStrokeColor = isSatellite ? "#000000" : "#ffffff";
              return (
                <Marker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  label={{
                    text: String(i + 1),
                    color: markerLabelColor,
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 14,
                    fillColor: markerFillColor,
                    fillOpacity: 1,
                    strokeColor: markerStrokeColor,
                    strokeWeight: 2,
                  }}
                  title={place.name}
                />
              );
            })}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#000000",
                    strokeOpacity: 0.5,
                    strokeWeight: 3,
                    geodesic: true,
                  },
                }}
              />
            )}

            {segmentDirections.map((dir, i) =>
              dir ? (
                <DirectionsRenderer
                  key={i}
                  directions={dir}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#000000",
                      strokeOpacity: 0.5,
                      strokeWeight: 3,
                      geodesic: true,
                    },
                  }}
                />
              ) : (
                <Polyline
                  key={i}
                  path={[
                    { lat: places[i].lat, lng: places[i].lng },
                    { lat: places[i + 1].lat, lng: places[i + 1].lng },
                  ]}
                  options={{
                    strokeColor: "#000000",
                    strokeOpacity: 0.2,
                    strokeWeight: 2,
                    geodesic: true,
                  }}
                />
              )
            )}

            {!directions && segmentDirections.length === 0 && places.length > 1 && (
              <Polyline
                path={places.map((p) => ({ lat: p.lat, lng: p.lng }))}
                options={{
                  strokeColor: "#000000",
                  strokeOpacity: 0.4,
                  strokeWeight: 2,
                  geodesic: true,
                }}
              />
            )}
          </>
        )}
      </GoogleMap>

      {/* 토스트 알림 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/90 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
