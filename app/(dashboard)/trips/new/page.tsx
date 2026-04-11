"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, FileText, MapPin, Globe, Sparkles, Key, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { generateTripWithAI, type AiProvider } from "./ai-actions";
import { cn } from "@/lib/utils";

const AI_PROVIDERS: { value: AiProvider; label: string; desc: string; color: string }[] = [
  { value: "claude", label: "Claude", desc: "Anthropic", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { value: "gemini", label: "Gemini", desc: "Google", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "chatgpt", label: "ChatGPT", desc: "OpenAI", color: "bg-green-50 border-green-200 text-green-700" },
];

const LOADING_MESSAGES = [
  "AI에게 여행 계획을 요청하고 있어요...",
  "여행지 정보를 분석 중이에요...",
  "맛집과 명소를 찾고 있어요...",
  "동선을 최적화하고 있어요...",
  "지도에 장소를 표시하고 있어요...",
  "거의 다 됐어요!",
];

export default function NewTripPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // AI settings
  const [aiProvider, setAiProvider] = useState<AiProvider>("claude");
  const [apiKey, setApiKey] = useState("");
  const [saveKey, setSaveKey] = useState(false);

  // Load saved AI settings from user metadata
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.ai_provider) {
        setAiProvider(user.user_metadata.ai_provider as AiProvider);
      }
      if (user?.user_metadata?.ai_api_key) {
        setApiKey(user.user_metadata.ai_api_key);
        setSaveKey(true);
      }
    });
  }, []);

  // Cycle loading messages
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isPending]);

  function getFormValues() {
    if (!formRef.current) return null;
    const form = new FormData(formRef.current);
    return {
      title: (form.get("title") as string) || "",
      description: (form.get("description") as string) || "",
      region: (form.get("region") as string) || "",
      start_date: (form.get("start_date") as string) || "",
      end_date: (form.get("end_date") as string) || "",
    };
  }

  async function handleManual() {
    const vals = getFormValues();
    if (!vals) return;
    setIsPending(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요한 기능입니다. 로그인 후 여행을 저장할 수 있어요.");
      setIsPending(false);
      return;
    }

    if (!vals.title) {
      setError("여행 제목을 입력해주세요.");
      setIsPending(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: vals.title,
        description: vals.description || null,
        start_date: vals.start_date || null,
        end_date: vals.end_date || null,
        region: vals.region || null,
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

  async function handleAi() {
    const vals = getFormValues();
    if (!vals) return;
    if (!apiKey.trim()) {
      setError("API 키를 입력해주세요.");
      return;
    }
    if (!vals.region) {
      setError("AI가 여행을 만들려면 지역을 입력해주세요.");
      return;
    }
    if (!vals.start_date || !vals.end_date) {
      setError("AI가 여행을 만들려면 날짜를 선택해주세요.");
      return;
    }

    setIsPending(true);
    setError(null);
    setLoadingMsgIdx(0);

    const result = await generateTripWithAI({
      ...vals,
      provider: aiProvider,
      apiKey: apiKey.trim(),
      saveKey,
    });

    if (result.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.push(`/trips/${result.tripId}`);
  }

  return (
    <>
      <div className="p-8 max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/trips"
            className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">새 여행 만들기</h1>
            <p className="text-gray-400 text-sm">여행의 기본 정보를 입력하세요</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 flex flex-col gap-6"
        >
          <form ref={formRef} className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            {/* 여행 제목 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-6 flex-shrink-0">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <Input
                  id="title"
                  name="title"
                  label="여행 제목"
                  placeholder="예: 서울 2박 3일, 제주도 가족여행"
                  autoFocus
                />
              </div>
            </div>

            {/* 설명 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-6 flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  설명 <span className="text-gray-300">(선택)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="여행 스타일이나 원하는 코스를 적어주세요 (AI가 참고해요)"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* 지역 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-6 flex-shrink-0">
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
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-6 flex-shrink-0">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input id="start_date" name="start_date" label="시작일" type="date" />
                <Input id="end_date" name="end_date" label="종료일" type="date" />
              </div>
            </div>

            {/* 에러 */}
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                {error}
              </p>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 justify-end pt-2">
              <Link href="/trips">
                <Button variant="secondary" type="button">취소</Button>
              </Link>
              <Button
                variant="primary"
                type="button"
                disabled={isPending}
                onClick={handleManual}
              >
                {isPending && !showAiPanel ? "생성 중..." : "내가 만들기"}
              </Button>

              {/* AI 버튼 */}
              <motion.button
                type="button"
                disabled={isPending}
                onClick={() => setShowAiPanel((v) => !v)}
                className="relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #c026d3)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 반짝이는 shimmer 효과 */}
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">AI가 만들어주기</span>
              </motion.button>
            </div>

            {/* AI 설정 패널 */}
            <AnimatePresence>
              {showAiPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-purple-100 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/30 p-5 flex flex-col gap-4">
                    {/* 헤더 */}
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">AI 설정</span>
                    </div>

                    {/* AI 모델 선택 */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">AI 모델 선택</p>
                      <div className="flex gap-2">
                        {AI_PROVIDERS.map(({ value, label, desc, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAiProvider(value)}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all",
                              aiProvider === value
                                ? color + " ring-2 ring-offset-1 ring-purple-400"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                            )}
                          >
                            <span className="font-semibold">{label}</span>
                            <span className="text-[10px] opacity-70">{desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* API 키 입력 */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1.5">
                        <Key className="w-3 h-3" />
                        API 키
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={
                          aiProvider === "claude"
                            ? "sk-ant-..."
                            : aiProvider === "gemini"
                            ? "AIza..."
                            : "sk-..."
                        }
                        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-purple-400 dark:focus:bg-gray-700 transition-all"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        키는 서버에서만 사용되며 외부로 전송되지 않아요.
                      </p>
                    </div>

                    {/* 저장 옵션 */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setSaveKey((v) => !v)}
                        className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                          saveKey
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        )}
                      >
                        {saveKey && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className="text-xs text-gray-600 dark:text-gray-400">이 API 키를 저장해서 다음에도 사용</span>
                    </label>

                    {/* AI 만들기 버튼 */}
                    <motion.button
                      type="button"
                      disabled={isPending}
                      onClick={handleAi}
                      className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #c026d3)" }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <motion.span
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                      />
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">AI로 여행 만들기</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* AI 로딩 오버레이 */}
      <AnimatePresence>
        {isPending && showAiPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/85 dark:bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6 text-center px-8">
              {/* 스파클 아이콘 애니메이션 */}
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #c026d3)" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-2">AI가 여행을 만들고 있어요</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-500 text-sm"
                  >
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* 진행 도트 */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
