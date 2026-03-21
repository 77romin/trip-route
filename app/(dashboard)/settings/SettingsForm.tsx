"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { User, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateProfile, updatePassword } from "./actions";

interface SettingsFormProps {
  email: string;
  fullName: string;
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
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 border border-gray-200"
      >
        <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
        <p className="text-black text-sm">저장됐어요.</p>
      </motion.div>
    );
  }
  if (state.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
      >
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-red-600 text-sm">{state.error}</p>
      </motion.div>
    );
  }
  return null;
}

export default function SettingsForm({ email, fullName }: SettingsFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfile,
    undefined
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    updatePassword,
    undefined
  );

  return (
    <div className="space-y-6">
      {/* 프로필 섹션 */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black">프로필</h2>
            <p className="text-xs text-gray-400">이름과 이메일 정보</p>
          </div>
        </div>
        <form action={profileAction} className="px-6 py-5 flex flex-col gap-4">
          <Input
            id="full_name"
            name="full_name"
            label="이름"
            defaultValue={fullName}
            placeholder="이름을 입력하세요"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600 font-medium">이메일</label>
            <input
              type="email"
              value={email}
              disabled
              className="h-11 w-full rounded-xl bg-gray-100 border border-gray-200 px-4 text-gray-400 text-sm cursor-not-allowed"
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
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black">비밀번호 변경</h2>
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
    </div>
  );
}
