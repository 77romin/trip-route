"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, FileText, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewTripPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요한 기능입니다. 로그인 후 여행을 저장할 수 있어요.");
      setIsPending(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: form.get("title") as string,
        description: form.get("description") as string || null,
        start_date: form.get("start_date") as string || null,
        end_date: form.get("end_date") as string || null,
        region: form.get("region") as string || null,
      })
      .select("id")
      .single();

    if (dbError) {
      setError(dbError.message);
      setIsPending(false);
      return;
    }

    router.push(`/trips/${data.id}`);
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/trips"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black">새 여행 만들기</h1>
          <p className="text-gray-400 text-sm">여행의 기본 정보를 입력하세요</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col gap-6"
      >
        {/* 여행 제목 */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mt-6 flex-shrink-0">
            <MapPin className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <Input
              id="title"
              name="title"
              label="여행 제목"
              placeholder="예: 서울 2박 3일, 제주도 가족여행"
              required
              autoFocus
            />
          </div>
        </div>

        {/* 설명 */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mt-6 flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm text-gray-600 font-medium">
              설명 <span className="text-gray-300">(선택)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="여행에 대한 간단한 메모를 남겨보세요"
              className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:bg-white transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* 지역 */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mt-6 flex-shrink-0">
            <Globe className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <Input
              id="region"
              name="region"
              label="지역"
              placeholder="예: 서울, 제주, 도쿄, 파리"
            />
          </div>
        </div>

        {/* 날짜 */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mt-6 flex-shrink-0">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Input
              id="start_date"
              name="start_date"
              label="시작일"
              type="date"
            />
            <Input
              id="end_date"
              name="end_date"
              label="종료일"
              type="date"
            />
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-500 text-sm px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            {error}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 justify-end pt-2">
          <Link href="/trips">
            <Button variant="secondary" type="button">
              취소
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? "생성 중..." : "여행 만들기"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
