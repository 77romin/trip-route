import Navbar from "@/components/landing/Navbar";
import HowToUseContent from "./HowToUseContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용법 — TripRoute",
};

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HowToUseContent />
    </div>
  );
}
