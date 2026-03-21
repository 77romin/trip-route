"use client";

import { motion } from "framer-motion";
import { MapPin, X, Check } from "lucide-react";

interface Props {
  name: string;
  address: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MapClickConfirm({ name, address, onConfirm, onCancel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/8 p-4 w-72 pointer-events-auto"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-black text-sm font-semibold truncate">{name}</p>
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">
            {address}
          </p>
          <p className="text-gray-400 text-xs mt-1.5">이 장소를 추가할까요?</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-300 hover:text-black transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          추가하기
        </button>
      </div>
    </motion.div>
  );
}
