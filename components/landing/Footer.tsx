import { Map } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* 로고 */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <Map className="w-4 h-4 text-white" />
          </div>
          <span className="text-black font-semibold">TripRoute</span>
        </div>

        <p className="text-gray-400 text-sm text-center">
          © 2026 TripRoute. 여행을 더 스마트하게.
        </p>

        <div className="flex items-center gap-6">
          {["이용약관", "개인정보처리방침", "문의하기"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
