"use client";

import { cn } from "@/lib/utils";
import {
  Map,
  PlusCircle,
  List,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { href: "/trips", icon: List, label: "내 여행" },
  { href: "/trips/new", icon: PlusCircle, label: "새 여행" },
  { href: "/map", icon: Map, label: "한눈에 보기" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/trips" ? pathname === "/trips" : pathname.startsWith(href);

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-60 h-screen flex-shrink-0 flex-col border-r border-gray-100 bg-white">
        {/* 로고 */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="text-black font-semibold tracking-tight">
              TripRoute
            </span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단: 로그아웃 */}
        <div className="px-3 py-4 border-t border-gray-100">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* 모바일 하단 네비바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-1 pb-safe">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                active ? "text-black" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-black" : "text-gray-400")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
