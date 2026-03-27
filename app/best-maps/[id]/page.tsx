import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TripDetailClient from "@/components/map/TripDetailClient";
import type { Trip, Place } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("title")
    .eq("id", id)
    .eq("is_public", true)
    .single();
  return {
    title: trip ? `${trip.title} — TripRoute` : "여행 — TripRoute",
  };
}

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: trip }, { data: places }] = await Promise.all([
    supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .single(),
    supabase
      .from("places")
      .select("*")
      .eq("trip_id", id)
      .order("day", { ascending: true })
      .order("order", { ascending: true }),
  ]);

  if (!trip) notFound();

  return (
    <div className="h-screen">
      <TripDetailClient
        trip={trip as Trip}
        initialPlaces={(places ?? []) as Place[]}
        isPublicView
      />
    </div>
  );
}
