"use client";

import { cn } from "@/lib/utils";
import { Map, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/(auth)/actions";
import Button from "@/components/ui/Button";

function getInitials(user: User): string {
  const fullName = user.user_metadata?.full_name as string | undefined;
  if (fullName) {
    return fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (user.email?.[0] ?? "?").toUpperCase();
}

function Avatar({ user }: { user: User }) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initials = getInitials(user);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt="프로필"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

const NAV_LINKS = [
  { label: "나의 지도", href: "/trips" },
  { label: "최고의 지도", href: "/best-maps" },
  { label: "모두의 지도", href: "/everyone-maps" },
  { label: "사용법", href: "/how-to-use" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthReady(true);
    });

    // 로그인/로그아웃 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors">
            <Map className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="text-black dark:text-white font-semibold text-lg tracking-tight">
            TripRoute
          </span>
        </Link>

        {/* 데스크톱 네비 링크 */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-gray-400 hover:text-black dark:hover:text-white text-sm transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* 데스크톱 우측 버튼 */}
        <div className="hidden md:flex items-center gap-3 min-w-[160px] justify-end">
          {!authReady ? null : user ? (
            <>
              <Link href="/trips">
                <Avatar user={user} />
              </Link>
              <form action={signOut}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/trips">
                <Button variant="primary" size="sm">
                  로그인 없이 시작하기
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴"
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-black dark:text-white" />
          ) : (
            <Menu className="w-5 h-5 text-black dark:text-white" />
          )}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden px-6 pt-2 pb-5 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm font-medium transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-3">
            {!authReady ? null : user ? (
              <>
                <Link href="/trips" onClick={() => setMenuOpen(false)}>
                  <Avatar user={user} />
                </Link>
                <form action={signOut}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className="flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    로그아웃
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/trips" onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="sm">
                    시작하기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
