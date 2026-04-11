"use client";

import { motion } from "framer-motion";
import {
  Zap,
  PlusCircle,
  Search,
  Map,
  Car,
  GripVertical,
  BookmarkCheck,
  ArrowRight,
  Check,
  Train,
  Bike,
  Minus,
  User,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── 단계별 시각적 목업 ────────────────────────────────────────

function VisualStart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
          <Map className="w-4 h-4 text-white" />
        </div>
        <span className="text-black dark:text-white font-semibold text-lg">TripRoute</span>
      </div>
      <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />
      <div className="w-full space-y-2.5">
        <div className="w-full h-11 rounded-xl bg-black flex items-center justify-center gap-2">
          <span className="text-white text-sm font-medium">
            로그인 없이 시작하기
          </span>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
        <div className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="text-gray-400 text-sm">로그인</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">회원가입 없이 모든 기능 사용 가능</p>
    </div>
  );
}

function VisualNewTrip() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
      <div className="h-2.5 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
      <div>
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-10 rounded-lg border border-black bg-white dark:bg-gray-800 flex items-center px-3">
          <div className="h-2.5 w-36 bg-gray-100 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div>
        <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center px-3">
          <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div>
          <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 w-32" />
        </div>
        <div>
          <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 w-32" />
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <div className="h-10 w-28 rounded-xl bg-black" />
      </div>
    </div>
  );
}

function VisualSearch() {
  const places = ["경복궁", "인사동", "광장시장"];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-2.5">
      <div className="h-10 rounded-lg border border-black dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center px-3 gap-2">
        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <div className="h-2.5 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
      <div className="space-y-2">
        {places.map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center px-3 gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium">{i + 1}</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-28" />
            </div>
            <div className="h-7 w-14 rounded-lg bg-black flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualMap() {
  const markers = [
    { x: 22, y: 62 },
    { x: 48, y: 28 },
    { x: 72, y: 52 },
    { x: 58, y: 78 },
  ];
  return (
    <div
      className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative"
      style={{ paddingBottom: "65%" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <svg className="absolute inset-0 w-full h-full">
        {markers.slice(0, -1).map((m, i) => (
          <line
            key={i}
            x1={`${m.x}%`}
            y1={`${m.y}%`}
            x2={`${markers[i + 1].x}%`}
            y2={`${markers[i + 1].y}%`}
            stroke="#000"
            strokeWidth="2"
            strokeOpacity="0.35"
            strokeDasharray="4 3"
          />
        ))}
      </svg>
      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-md -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <span className="text-white text-xs font-bold">{i + 1}</span>
        </div>
      ))}
      {/* Layer buttons */}
      <div className="absolute top-3 right-3 flex gap-1">
        {["로드맵", "위성", "지형"].map((label, i) => (
          <div
            key={label}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium",
              i === 0 ? "bg-black text-white" : "bg-white text-gray-500"
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualTravelMode() {
  const modes = [
    { icon: Car, active: false },
    { icon: Train, active: true },
    { icon: Bike, active: false },
    { icon: User, active: false },
    { icon: Minus, active: false },
  ];
  const labels = ["자동차", "대중교통", "자전거", "도보", "직선"];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {modes.map(({ icon: Icon, active }, i) => (
          <div
            key={i}
            className={cn(
              "w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5",
              active
                ? "bg-black"
                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            )}
          >
            <Icon
              className={cn("w-5 h-5", active ? "text-white" : "text-gray-400")}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        {labels[1]} 선택됨
      </p>
      <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1.5">
        <div className="h-2.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-2 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function VisualDrag() {
  const cards = [
    { lifted: false },
    { lifted: true },
    { lifted: false },
  ];
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2.5">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-xl border flex items-center px-3 gap-3 h-14 transition-all",
            card.lifted
              ? "border-gray-300 dark:border-gray-600 shadow-lg shadow-black/10 -translate-y-0.5"
              : "border-gray-100 dark:border-gray-700"
          )}
        >
          <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab flex-shrink-0" />
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{i + 1}</span>
          </div>
          <div
            className={cn(
              "h-2.5 rounded flex-1",
              card.lifted ? "bg-gray-200 dark:bg-gray-600 w-16" : "bg-gray-100 dark:bg-gray-700"
            )}
          />
          <div className="h-2 w-10 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0" />
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center pt-1">
        드래그해서 순서 변경
      </p>
    </div>
  );
}

function VisualShare() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div>
          <p className="text-black dark:text-white text-sm font-medium">공개 여행으로 설정</p>
          <p className="text-gray-400 text-xs">모두의 지도에 표시됩니다</p>
        </div>
        <div className="w-11 h-6 rounded-full bg-black flex items-center justify-end px-0.5 flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Map className="w-6 h-6 text-gray-300" />
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-14 rounded-full bg-black" />
          </div>
          <div className="flex gap-3">
            <div className="h-2 w-12 bg-gray-100 rounded" />
            <div className="h-2 w-12 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 단계 정의 ──────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Zap,
    title: "로그인 없이 바로 시작",
    desc: "회원가입이나 로그인 없이도 지도 탐색과 여행 계획의 모든 기능을 즉시 사용할 수 있어요.",
    points: ["회원가입 불필요", "모든 기능 즉시 사용 가능", "저장만 로그인 필요"],
    Visual: VisualStart,
  },
  {
    number: "02",
    icon: PlusCircle,
    title: "새 여행 만들기",
    desc: "여행 제목, 지역, 날짜를 입력하면 나만의 여행 플래너가 만들어져요. 여러 여행을 동시에 관리할 수 있어요.",
    points: ["제목 · 지역 · 기간 설정", "설명 메모 추가", "여러 여행 동시 관리"],
    Visual: VisualNewTrip,
  },
  {
    number: "03",
    icon: Search,
    title: "장소 검색하고 추가",
    desc: "Google Maps 기반 장소 검색으로 원하는 곳을 빠르게 찾아 일자별로 추가하세요.",
    points: ["실시간 장소 자동완성", "카테고리별 필터 (명소·식당·카페 등)", "일자별로 구성"],
    Visual: VisualSearch,
  },
  {
    number: "04",
    icon: Map,
    title: "지도에서 동선 확인",
    desc: "추가한 장소들이 지도 위에 번호 순으로 표시되고 이동 경로가 자동 계산돼요.",
    points: ["번호 마커로 방문 순서 표시", "실시간 경로 렌더링", "로드맵 · 위성 · 지형 스타일 전환"],
    Visual: VisualMap,
  },
  {
    number: "05",
    icon: Car,
    title: "이동 수단 선택",
    desc: "자동차, 대중교통, 자전거, 도보 중 원하는 이동 수단을 선택해 실제 경로를 확인하세요.",
    points: ["5가지 이동 수단 지원", "Google Maps 실시간 경로 표시", "경로 없을 시 직선으로 자동 폴백"],
    Visual: VisualTravelMode,
  },
  {
    number: "06",
    icon: GripVertical,
    title: "드래그로 순서 변경",
    desc: "장소 카드를 드래그 앤 드롭으로 방문 순서를 손쉽게 바꿀 수 있어요. 지도 경로가 실시간으로 업데이트돼요.",
    points: ["직관적인 드래그 앤 드롭", "지도 경로 실시간 업데이트", "변경사항 자동 저장"],
    Visual: VisualDrag,
  },
  {
    number: "07",
    icon: BookmarkCheck,
    title: "저장하고 공유하기",
    desc: "로그인 후 여행을 저장하고, 공개 설정으로 다른 여행자와 공유해 커뮤니티에 기여해보세요.",
    points: ["로그인 후 클라우드 저장", "공개 여행으로 설정 가능", "모두의 지도에 공개"],
    Visual: VisualShare,
  },
] as const;

// ── 메인 컴포넌트 ─────────────────────────────────────────────

export default function HowToUseContent() {
  return (
    <>
      {/* ── 히어로 ─────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-gray-100 dark:border-gray-800 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              총 7단계
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white mb-5 tracking-tight leading-tight">
              TripRoute로
              <br />
              <span className="text-gray-400">스마트하게 여행하는 법</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              회원가입 없이 바로 시작할 수 있어요.
              <br />
              아래 단계를 따라 나만의 여행 동선을 완성해보세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 단계별 섹션 ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="space-y-28">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const Visual = step.Visual;
            const isEven = i % 2 === 0;

            return (
              <div key={step.number}>
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                >
                  {/* ── 텍스트 영역 ─────────────────────────── */}
                  <div className={cn(!isEven && "lg:order-2")}>
                    {/* 스텝 번호 + 아이콘 */}
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0 shadow-md shadow-black/10"
                      >
                        <Icon className="w-6 h-6 text-white dark:text-black" />
                      </motion.div>
                      <span className="text-7xl font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
                        {step.number}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-black dark:text-white mb-3 tracking-tight">
                      {step.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-7">
                      {step.desc}
                    </p>

                    {/* 포인트 리스트 */}
                    <ul className="space-y-3">
                      {step.points.map((point, pi) => (
                        <motion.li
                          key={point}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.2 + pi * 0.07 }}
                          className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-black dark:text-white" />
                          </div>
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* ── 비주얼 영역 ─────────────────────────── */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(!isEven && "lg:order-1")}
                  >
                    <Visual />
                  </motion.div>
                </motion.div>

                {/* 스텝 구분선 (마지막 제외) */}
                {i < STEPS.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ transformOrigin: "left" }}
                    className="mt-28 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="bg-black py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
              지금 바로 시작해보세요
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              로그인 없이도 모든 기능을 즉시 사용할 수 있어요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/trips">
                <button className="group h-14 px-8 rounded-xl bg-white hover:bg-gray-100 text-black text-base font-medium transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                  로그인 없이 시작하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/everyone-maps">
                <button className="h-14 px-8 rounded-xl border border-white/20 hover:border-white/40 text-white hover:bg-white/5 text-base font-medium transition-all w-full sm:w-auto">
                  모두의 지도 보기
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
