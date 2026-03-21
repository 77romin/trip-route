import DemoDetailClient from "@/components/map/DemoDetailClient";
import { DEMO_TRIP, DEMO_PLACES } from "@/lib/demo-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "데모 — TripRoute",
};

export default function DemoPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <DemoDetailClient trip={DEMO_TRIP} places={DEMO_PLACES} />
    </div>
  );
}
