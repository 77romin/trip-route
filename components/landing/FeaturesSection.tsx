"use client";

import { motion } from "framer-motion";
import { Map, Route, Clock, Share2, Zap, Globe } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Map,
    title: "실시간 지도 시각화",
    description: "Google Maps 위에서 동선을 직접 확인하고 드래그로 순서를 바꿔보세요.",
  },
  {
    icon: Route,
    title: "최적 경로 자동 계산",
    description: "교통 상황과 이동 시간을 고려해 가장 효율적인 순서를 제안합니다.",
  },
  {
    icon: Clock,
    title: "일정 타임라인",
    description: "각 장소의 체류 시간을 설정하면 하루 일정을 타임라인으로 확인할 수 있어요.",
  },
  {
    icon: Share2,
    title: "동행자와 공유",
    description: "링크 하나로 여행 계획을 공유하고, 실시간으로 함께 편집하세요.",
  },
  {
    icon: Zap,
    title: "AI 장소 추천",
    description: "선택한 장소 주변의 맛집, 카페, 명소를 AI가 자동으로 추천해드려요.",
  },
  {
    icon: Globe,
    title: "다국가 여행 지원",
    description: "해외 여행도 OK. 전 세계 어디서든 동선을 계획하세요.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-32 relative bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-black dark:text-white mb-5">
            여행이 더 즐거워지는
            <br />
            <span className="text-gray-300 dark:text-gray-600">스마트한 기능들</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            복잡한 여행 계획을 단순하게. 필요한 기능을 딱 맞게 제공합니다.
          </p>
        </motion.div>

        {/* 기능 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 cursor-default transition-all duration-300 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
              >
                {/* 아이콘 */}
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5 group-hover:bg-black dark:group-hover:bg-white transition-colors duration-300">
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-black dark:text-white font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
