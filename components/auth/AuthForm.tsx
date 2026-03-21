"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface AuthFormProps {
  mode: "login" | "signup";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-current">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8.94-.19 1.84-.88 2.95-.84 1.32.06 2.35.76 2.99 1.9-2.72 1.66-2.28 5.3.29 6.39-.57 1.56-1.3 3.1-2.31 4.63zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [socialPending, setSocialPending] = useState<"google" | "apple" | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleOAuthSignIn(provider: "google" | "apple") {
    setSocialPending(provider);
    setSocialError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setSocialError(error.message);
      setSocialPending(null);
    }
    // 성공 시 브라우저가 OAuth 제공자 URL로 이동하므로 이후 코드 실행 안 됨
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-black font-semibold text-xl tracking-tight">
              TripRoute
            </span>
          </Link>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">
              {isLogin ? "다시 만나서 반가워요" : "여행을 시작해볼까요"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? "계정에 로그인하여 여행 계획을 이어가세요."
                : "지금 무료로 가입하고 스마트한 여행 동선을 경험하세요."}
            </p>
          </div>

          {/* 소셜 로그인 */}
          <div className="flex flex-col gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={socialPending !== null}
              className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-black text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {socialPending === "google" ? "연결 중..." : "Google로 계속하기"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={socialPending !== null}
              className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-black text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AppleIcon />
              {socialPending === "apple" ? "연결 중..." : "Apple로 계속하기"}
            </button>

            {socialError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{socialError}</p>
              </motion.div>
            )}
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는 이메일로</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 이메일/비밀번호 폼 */}
          <form action={formAction} className="flex flex-col gap-4">
            {!isLogin && (
              <Input
                id="full_name"
                name="full_name"
                label="이름"
                type="text"
                placeholder="홍길동"
                required
                autoComplete="name"
              />
            )}
            <Input
              id="email"
              name="email"
              label="이메일"
              type="email"
              placeholder="hello@example.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              label="비밀번호"
              type="password"
              placeholder={isLogin ? "비밀번호 입력" : "8자 이상 입력"}
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {/* 에러 메시지 */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{state.error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending}
              className="mt-2 w-full"
            >
              {isPending
                ? "처리 중..."
                : isLogin
                  ? "로그인"
                  : "무료로 시작하기"}
            </Button>
          </form>

          {/* 전환 링크 */}
          <p className="text-center text-gray-400 text-sm mt-6">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="text-black font-medium hover:underline transition-colors"
            >
              {isLogin ? "회원가입" : "로그인"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
