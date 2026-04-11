"use client";

import { useActionState, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, CheckCircle2, AlertCircle, Camera, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateProfile, updatePassword, uploadAvatar, saveAiSettings } from "./actions";
import { cn } from "@/lib/utils";
import type { AiProvider } from "../trips/new/ai-actions";

const AI_PROVIDERS: { value: AiProvider; label: string; desc: string }[] = [
  { value: "claude", label: "Claude", desc: "Anthropic" },
  { value: "gemini", label: "Gemini", desc: "Google" },
  { value: "chatgpt", label: "ChatGPT", desc: "OpenAI" },
];

interface SettingsFormProps {
  email: string;
  fullName: string;
  avatarUrl: string;
  savedAiProvider?: string;
  savedAiKey?: string;
}

function StatusMessage({
  state,
}: {
  state: { error?: string; success?: boolean } | undefined;
}) {
  if (!state) return null;
  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
        <p className="text-black dark:text-white text-sm">저장됐어요.</p>
      </motion.div>
    );
  }
  if (state.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
      >
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-red-600 dark:text-red-400 text-sm">{state.error}</p>
      </motion.div>
    );
  }
  return null;
}

export default function SettingsForm({ email, fullName, avatarUrl, savedAiProvider, savedAiKey }: SettingsFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfile,
    undefined
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    updatePassword,
    undefined
  );
  const [aiState, aiAction, isAiPending] = useActionState(saveAiSettings, undefined);
  const [aiProvider, setAiProvider] = useState<AiProvider>((savedAiProvider as AiProvider) ?? "claude");
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    setAvatarUploading(false);

    if (result.error) {
      setAvatarError(result.error);
    } else if (result.url) {
      setAvatar(result.url);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* 프로필 섹션 */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black dark:text-white">프로필</h2>
            <p className="text-xs text-gray-400">사진, 이름, 이메일 정보</p>
          </div>
        </div>
        <form action={profileAction} className="px-6 py-5 flex flex-col gap-4">
          {/* 아바타 */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
              >
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">프로필 사진</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {avatarUploading ? "업로드 중..." : "클릭하여 사진을 변경하세요 (2MB 이하)"}
              </p>
              {avatarError && (
                <p className="text-xs text-red-500 mt-1">{avatarError}</p>
              )}
            </div>
          </div>

          <Input
            id="full_name"
            name="full_name"
            label="이름"
            defaultValue={fullName}
            placeholder="이름을 입력하세요"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">이메일</label>
            <input
              type="email"
              value={email}
              disabled
              className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">이메일은 변경할 수 없어요.</p>
          </div>
          <StatusMessage state={profileState} />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isProfilePending}
            >
              {isProfilePending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </section>

      {/* 비밀번호 변경 섹션 */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black dark:text-white">비밀번호 변경</h2>
            <p className="text-xs text-gray-400">새 비밀번호는 8자 이상</p>
          </div>
        </div>
        <form action={passwordAction} className="px-6 py-5 flex flex-col gap-4">
          <Input
            id="new_password"
            name="new_password"
            label="새 비밀번호"
            type="password"
            placeholder="새 비밀번호 입력"
            minLength={8}
            required
          />
          <Input
            id="confirm_password"
            name="confirm_password"
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            minLength={8}
            required
          />
          <StatusMessage state={passwordState} />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </form>
      </section>

      {/* AI 설정 섹션 */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #c026d3)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black dark:text-white">AI 설정</h2>
            <p className="text-xs text-gray-400">AI 여행 생성에 사용할 API 키를 저장하세요</p>
          </div>
        </div>
        <form action={aiAction} className="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" name="ai_provider" value={aiProvider} />

          {/* AI 모델 선택 */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">기본 AI 모델</p>
            <div className="flex gap-2">
              {AI_PROVIDERS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAiProvider(value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all",
                    aiProvider === value
                      ? "border-purple-400 bg-purple-50 text-purple-700 ring-2 ring-offset-1 ring-purple-400 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-700"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API 키 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">API 키</label>
            <input
              type="password"
              name="ai_api_key"
              defaultValue={savedAiKey ?? ""}
              placeholder={
                aiProvider === "claude" ? "sk-ant-..." : aiProvider === "gemini" ? "AIza..." : "sk-..."
              }
              className="h-11 w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
            <p className="text-xs text-gray-400">
              키는 계정에 저장되며 여행 생성 시 서버에서만 사용돼요.
            </p>
          </div>

          <StatusMessage state={aiState} />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isAiPending}
            >
              {isAiPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
