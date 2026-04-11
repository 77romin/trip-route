import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripRoute — 여행 동선을 스마트하게",
  description:
    "AI 기반 여행 동선 최적화 서비스. 목적지를 추가하고, 최적의 여행 루트를 설계하세요.",
  keywords: ["여행", "동선", "루트", "지도", "여행계획"],
  openGraph: {
    title: "TripRoute",
    description: "여행 동선을 스마트하게",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-white dark:bg-gray-950">{children}</body>
    </html>
  );
}
