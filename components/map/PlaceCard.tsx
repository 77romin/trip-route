"use client";

import { cn } from "@/lib/utils";
import {
  Coffee,
  MapPin,
  Building2,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Circle,
  X,
  Clock,
  GripVertical,
} from "lucide-react";
import type { DragControls } from "framer-motion";
import type { Place, PlaceCategory } from "@/types";

const CATEGORY_CONFIG: Record<
  PlaceCategory,
  { icon: React.ElementType; label: string }
> = {
  attraction: { icon: MapPin, label: "명소" },
  restaurant: { icon: UtensilsCrossed, label: "식당" },
  cafe: { icon: Coffee, label: "카페" },
  hotel: { icon: Building2, label: "숙소" },
  transport: { icon: Car, label: "교통" },
  shopping: { icon: ShoppingBag, label: "쇼핑" },
  other: { icon: Circle, label: "기타" },
};

interface PlaceCardProps {
  place: Place;
  index: number;
  onRemove?: () => void;
  onClick?: () => void;
  dragControls?: DragControls;
  readOnly?: boolean;
}

export default function PlaceCard({
  place,
  index,
  onRemove,
  onClick,
  dragControls,
  readOnly = false,
}: PlaceCardProps) {
  const config = CATEGORY_CONFIG[place.category ?? "other"];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white rounded-xl border border-gray-100 p-3.5 flex items-start gap-2 hover:border-gray-200 transition-all",
        onClick && "cursor-pointer"
      )}
    >
      {/* 드래그 핸들 */}
      {dragControls && (
        <div
          className="cursor-grab active:cursor-grabbing touch-none text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5 pt-0.5"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* 순서 번호 */}
      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-white">{index}</span>
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="p-0.5 rounded bg-gray-100">
                <Icon className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-xs text-gray-500">{config.label}</span>
            </div>
            <h4 className="text-black text-sm font-medium truncate">
              {place.name}
            </h4>
            {place.address && (
              <p className="text-gray-400 text-xs mt-0.5 truncate">
                {place.address}
              </p>
            )}
          </div>

          {/* 삭제 버튼 */}
          {!readOnly && onRemove && (
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0"
            >
              <X className={cn("w-3.5 h-3.5 text-gray-300 hover:text-red-500")} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1.5">
          {place.duration_minutes && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{place.duration_minutes}분</span>
            </div>
          )}
          {place.notes && (
            <p className="text-gray-400 text-xs truncate">{place.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
