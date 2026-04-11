"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, Star } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const MOCK_PLACES = [
  { name: "경복궁", time: "09:00", cat: "명소" },
  { name: "인사동", time: "11:00", cat: "쇼핑" },
  { name: "광장시장", time: "13:00", cat: "식사" },
  { name: "남산타워", time: "16:00", cat: "명소" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* 격자 배경 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* 왼쪽: 텍스트 */}
        <div>
          {/* 배지 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium mb-8 bg-gray-50 dark:bg-gray-800"
          >
            <Star className="w-3.5 h-3.5" />
            <span>스마트 여행 동선 최적화</span>
          </motion.div>

          {/* 헤드라인 */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="text-5xl lg:text-6xl font-bold text-black dark:text-white leading-[1.1] tracking-tight mb-6"
          >
            나의 여행?
            <br />
            <span className="text-gray-400">
              너의 여행!
            </span>
            <br />
            우리의 여행.
          </motion.h1>

          {/* 서브텍스트 */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md"
          >
            내가 만든 동선을 공유하고, 검증된 루트를 그대로 따라가 보세요.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/trips">
              <Button size="lg" variant="primary" className="group w-full sm:w-auto">
                로그인 없이 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Navigation className="w-5 h-5" />
                데모 보기
              </Button>
            </Link>
          </motion.div>

        </div>

        {/* 오른쪽: UI 목업 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative animate-float"
        >
          {/* 여행 카드 목업 */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 dark:shadow-black/30">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-xs mb-1">여행 계획</p>
                <h3 className="text-black dark:text-white font-semibold text-lg">서울 2박 3일</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                <span className="text-black dark:text-white text-xs font-medium">1일차</span>
              </div>
            </div>

            {/* 동선 리스트 */}
            <div className="space-y-3">
              {MOCK_PLACES.map((place, i) => (
                <motion.div
                  key={place.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                >
                  {/* 순서 번호 */}
                  <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-black text-xs font-bold">{i + 1}</span>
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-black dark:text-white text-sm font-medium truncate">{place.name}</p>
                    <p className="text-gray-400 text-xs">{place.time} · {place.cat}</p>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* 하단 요약 */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="text-center">
                <p className="text-gray-400 text-xs">총 거리</p>
                <p className="text-black dark:text-white font-semibold text-sm">8.2 km</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">예상 시간</p>
                <p className="text-black dark:text-white font-semibold text-sm">9시간</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">장소</p>
                <p className="text-black dark:text-white font-semibold text-sm">4곳</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black text-xs font-medium transition-colors">
                지도 보기
              </button>
            </div>
          </div>

          {/* 플로팅 배지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/5 dark:shadow-black/30 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span className="text-black dark:text-white text-xs font-medium">최적화 완료</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/5 dark:shadow-black/30"
          >
            <p className="text-gray-400 text-xs">이동 절약</p>
            <p className="text-black dark:text-white font-bold text-sm">32분 단축</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
