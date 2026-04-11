"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section className="py-32 relative bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-black dark:bg-white rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white dark:text-black mb-6 leading-tight">
            지금 바로
            <br />
            <span className="text-gray-400 dark:text-gray-600">
              여행을 계획해보세요
            </span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
            회원가입 없이도 바로 사용 가능. 계정을 만들면 여행 계획을 저장하고 공유할 수 있어요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips">
              <Button
                size="lg"
                className="group w-full sm:w-auto bg-white hover:bg-gray-100 text-black dark:bg-black dark:hover:bg-gray-900 dark:text-white shadow-none"
              >
                로그인 없이 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
